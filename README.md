# gal — UI DESIGNER (Warp)

Лендинг-портфолио: WebGL-заголовок (ogl), магнитный док с тултипами и
панелями, фоновая галерея из видео/скриншотов (three.js: ряды с дрейфом,
линза, hover-подсветка карточек, свап галерей по клику).

## Стек

Vite + React 19 · Tailwind 3 · three (галерея) · ogl (заголовок) · motion (тултипы)

## Команды

```bash
npm run dev      # http://localhost:8080
npm run build    # dist/
npm run lint     # eslint
```

## Контент

`public/motion/<галерея>/*` — mp4 (h264 ≤720p, loop) + jpg-скриншоты;
`src/data/clips.js` — список карточек с реальными iw/ih (ffprobe).
`public/cv.html` — CV по кнопке «Скачать CV».

## Деплой

Прод-сборка: `npm run build`, статика в `dist/` (пути относительные —
можно хостить на любом префиксе). CI — GitHub Actions.
