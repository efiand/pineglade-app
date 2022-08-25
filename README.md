# pineglade-app

Сервер, сборщик статических страниц и линтер с нулевой конфигурацией.

## Используемые инструменты

- [fastify](https://fastify.io) - сервер (генерирует HTML в режиме разработки, может использоваться для бэкенда).
- [browser-sync](https://browsersync.io/) - слежение за файлами: запуск кастомных задач и перезагрузка страниц в браузерах.
- [svelte](https://ru.svelte.dev/) - шаблонизация на клиентской и серверной стороне, JS-логика (связывание данных и реактивность) из одних и тех же исходников.
- [webpack](https://webpack.js.org/) - сборка серверных и клиентских вариантов svelte-приложения.
- [eslint](https://eslint.org/) - линтинг скриптов и svelte-компонентоа.
- [postcss](https://postcss.org/) - сборка стилей из исходников с использованием возможностей препроцессоров.
- [stylelint](https://stylelint.io/) - линтинг стилей.
- Собственное встроенное решение для сборки стекового векторного спрайте.
- [svgo](https://github.com/svg/svgo) - средство для оптимизации векторной графики.
- [squoosh](https://github.com/GoogleChromeLabs/squoosh/tree/dev/libsquoosh) - средство для оптимизации растровой графики и конвертации её в webp.
- [pineglade-w3c](https://www.npmjs.com/package/pineglade-w3c) - валидация HTML (с оффлайн-фоллбэком при недоступности онлайн-валидатора).
- [pineglade-config](https://www.npmjs.com/package/pineglade-config) - валидация БЭМ и набор настроек для svgo, eslint, stylelint.
- [pineglade-pp](https://www.npmjs.com/package/pineglade-pp/) - плагин для pixelperfect-верстки. Доступен в режиме разработки по нажатию клавиши P.

## Установка

- Выполнить `npm i -E pineglade-pp`. Также поддерживается pnpm.
- В `package.json` прописать:

```json
{
  "pre-commit": "lint",
  "scripts": {
    "build": "npm start build",
    "dev": "npm start dev",
    "lint": "npm start lint",
    "start": "node node_modules/pineglade-app"
  }
}
```

## Команды

- `npm run build` - сборка статического проекта.
- `npm run dev` - сборка и запуск сервера в режиме раработки.
- `npm start` - запуск сервера в продакшн-режиме.
- `npm run lint` - запуск линтеров.
