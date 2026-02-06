import { ThemeName } from '@prisma/client'

export const defaultModes = [
  {
    name: 'Усі чати',
    theme: ThemeName.BLUE,
    scheduledCallMode: true,
    stickers: false,
    restrictedSmileMode: true,
    quickMessages: [
      'Привіт 👋',
      'Як ти?',
      'На звʼязку 🙂',
      'Ок 👍',
    ],
  },
  {
    name: 'Робота',
    theme: ThemeName.PASTEL,
    scheduledCallMode: false,
    stickers: true,
    restrictedSmileMode: true,
    quickMessages: [
      'Готово.',
      'Перевір, будь ласка.',
      'Потрібна відповідь.',
      'Домовились.',
    ],
  },
  {
    name: `Сім'я`,
    theme: ThemeName.YELLOW,
    scheduledCallMode: false,
    stickers: true,
    restrictedSmileMode: true,
    quickMessages: [
      'Як ви? ❤️',
      'Я скоро буду 🚗',
      'Все добре? 🙂',
      'Обіймаю 🤗',
    ],
  },
  {
    name: 'Друзі',
    theme: ThemeName.PURPLE,
    scheduledCallMode: true,
    stickers: true,
    restrictedSmileMode: false,
    quickMessages: [
      'Погнали 😎',
      'Ти де? 👀',
      'Йдемо сьогодні? 🎉',
      'Є плани? 😉',
    ],
  },
]

