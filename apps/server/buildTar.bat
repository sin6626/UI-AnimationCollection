@echo off
chcp 65001 > nul
cd /d %~dp0

echo ========== 打包 ==========
tar -cf deploy.tar dist .dockerignore .env docker-compose.yml Dockerfile package.json

if errorlevel 1 (
    echo 打包失败
    pause
    exit /b 1
)

echo.
echo ========== 完成 ==========
echo 文件：%~dp0deploy.tar
dir deploy.tar

pause
