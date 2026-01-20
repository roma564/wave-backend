import { ThemeName } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateThemeDto {
  @IsEnum(ThemeName)
  theme: ThemeName;
}
