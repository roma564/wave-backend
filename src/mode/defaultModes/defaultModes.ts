import { ThemeName } from '@prisma/client'

export const defaultModes = [
  {
    name: 'standartMode',
    theme: ThemeName.BLUE,
    scheduledCallMode: true,
    stickers: false,
    restrictedSmileMode: true,
  },
  {
    name: 'workMode',
    theme: ThemeName.GREEN,
    scheduledCallMode: false,
    stickers: true,
    restrictedSmileMode: true,
  },
  {
    name: 'familyMode',
    theme: ThemeName.YELLOW,
    scheduledCallMode: false,
    stickers: true,
    restrictedSmileMode: true,
  },
  {
    name: 'creativeMode',
    theme: ThemeName.PURPLE,
    scheduledCallMode: true,
    stickers: true,
    restrictedSmileMode: false,
  },
]
