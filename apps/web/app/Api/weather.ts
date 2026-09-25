import { onBeforeUnmount, onMounted, ref } from 'vue'

interface WeatherResponse {
  current: {
    temperature_2m: number
    weather_code: number
    is_day: number
  }
}

interface CachedWeather {
  latitude: number
  longitude: number
  savedAt: number
  current: WeatherResponse['current']
}

const weatherCacheKey = 'shouping-weather-v1'
const weatherCacheDuration = 30 * 60 * 1000

export function useLocalWeather() {
  const latitude = ref(0)
  const longitude = ref(0)
  const weatherInfo = ref({
    temp: '',
    condition: '获取位置中…',
    icon: 'i-lucide-map-pin'
  })

  let weatherRequestLog = {
    method: 'GET',
    url: 'https://api.open-meteo.com/v1/forecast',
    params: {} as Record<string, unknown>,
    headers: {} as Record<string, string>
  }

  const { data: weatherData, error: weatherError, status: weatherStatus, execute: fetchWeather } = useFetch<WeatherResponse>(
    'https://api.open-meteo.com/v1/forecast',
    {
      server: false,
      immediate: false,
      watch: false,
      query: {
        latitude,
        longitude,
        current: 'temperature_2m,weather_code,is_day',
        forecast_days: 1
      },
      onRequest({ request, options }) {
        weatherRequestLog = {
          method: 'GET',
          url: String(request),
          params: options.query ?? {},
          headers: Object.fromEntries(new Headers(options.headers).entries())
        }
        console.log('[Weather Request]', JSON.stringify(weatherRequestLog, null, 2))
      },
      onResponse({ response }) {
        console.log('[Weather Response]', JSON.stringify({
          statusCode: response.status,
          ...weatherRequestLog,
          url: response.url,
          response: response._data
        }, null, 2))
      },
      onRequestError({ error }) {
        console.error('[Weather Error]', JSON.stringify({
          statusCode: null,
          ...weatherRequestLog,
          response: { message: error.message }
        }, null, 2))
      },
      onResponseError({ response }) {
        console.error('[Weather Error]', JSON.stringify({
          statusCode: response.status,
          ...weatherRequestLog,
          url: response.url,
          response: response._data
        }, null, 2))
      }
    }
  )

  function showWeather(current: WeatherResponse['current']) {
    const code = current.weather_code
    const day = current.is_day === 1
    const description = code === 0 ? '晴朗'
      : code <= 2 ? '多云'
        : code === 3 ? '阴天'
          : code <= 48 ? '有雾'
            : code <= 57 ? '毛毛雨'
              : code <= 67 ? '有雨'
                : code <= 77 ? '有雪'
                  : code <= 82 ? '阵雨'
                    : code <= 86 ? '阵雪' : '雷雨'
    const icon = code === 0 ? (day ? 'i-lucide-sun-medium' : 'i-lucide-moon')
      : code <= 3 ? 'i-lucide-cloud-sun'
        : code <= 48 ? 'i-lucide-cloud-fog'
          : code <= 67 ? 'i-lucide-cloud-rain'
            : code <= 77 || (code >= 85 && code <= 86) ? 'i-lucide-cloud-snow'
              : code <= 82 ? 'i-lucide-cloud-rain' : 'i-lucide-cloud-lightning'

    weatherInfo.value = {
      temp: `${Math.round(current.temperature_2m)}°C`,
      condition: description,
      icon
    }
  }

  function loadLocalWeather() {
    if (!navigator.geolocation) {
      weatherInfo.value.condition = '定位不可用'
      return
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      latitude.value = Number(coords.latitude.toFixed(2))
      longitude.value = Number(coords.longitude.toFixed(2))

      try {
        const cached = JSON.parse(localStorage.getItem(weatherCacheKey) ?? 'null') as CachedWeather | null
        if (cached && cached.latitude === latitude.value && cached.longitude === longitude.value
          && Date.now() - cached.savedAt < weatherCacheDuration) {
          showWeather(cached.current)
          return
        }
      } catch {
        // 存储不可用时正常请求天气。
      }

      if (weatherStatus.value === 'pending') return
      weatherInfo.value.condition = '天气加载中…'
      await fetchWeather()
      const current = weatherData.value?.current
      if (weatherError.value || !current || !Number.isFinite(current.temperature_2m)) {
        weatherInfo.value.condition = '天气不可用'
        return
      }

      showWeather(current)
      try {
        localStorage.setItem(weatherCacheKey, JSON.stringify({
          latitude: latitude.value,
          longitude: longitude.value,
          savedAt: Date.now(),
          current
        } satisfies CachedWeather))
      } catch {
        // 私密模式等场景可能禁止写入，天气仍可正常显示。
      }
    }, () => {
      weatherInfo.value.condition = '未授权定位'
    }, { timeout: 10000, maximumAge: 60000 })
  }

  let weatherTimer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    loadLocalWeather()
    weatherTimer = setInterval(loadLocalWeather, weatherCacheDuration)
  })

  onBeforeUnmount(() => {
    if (weatherTimer) {
      clearInterval(weatherTimer)
      weatherTimer = null
    }
  })

  return { weatherInfo }
}
