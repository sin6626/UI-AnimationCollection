// common/decorators/public.decorator.ts
import {SetMetadata} from '@nestjs/common';

import {CommonConstants} from '../constants/common.constants.js';

export const
    Public = () =>
        SetMetadata(CommonConstants.IS_PUBLIC_KEY, true);
