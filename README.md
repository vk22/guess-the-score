# Football Predictions

Nuxt-приложение для прогнозирования точного счета футбольных матчей.

## Требования

- Node.js 20.19+ или 22.12+
- Docker Desktop

## Запуск

```bash
cp .env.example .env
npm install
npm run db:up
npm run prisma:migrate -- --name init
npm run dev
```

## Команды

```bash
npm run dev
npm run db:up
npm run db:down
npm run db:logs
npm run typecheck
npm test
npm run build
npm run prisma:studio
```

## Сессии

`NUXT_SESSION_PASSWORD` в `.env` должен содержать минимум 32 символа.

```bash
openssl rand -base64 48
```

## Football Data API

Для бесплатного актуального календаря используется football-data.org.

1. Создайте API key на https://www.football-data.org/client/register.
2. Запишите его в `.env`:

```bash
NUXT_FOOTBALL_DATA_API_KEY="your-api-key"
NUXT_FOOTBALL_DATA_COMPETITION="WC"
NUXT_FOOTBALL_DATA_START_DATE="2026-06-11"
```

`NUXT_FOOTBALL_API_KEY` остается fallback для платного API-Football.
Синхронизация football-data.org ограничена турниром `WC` (FIFA World Cup).
Каждый запуск повторно загружает матчи от даты открытия турнира, поэтому
результаты уже сыгранных матчей не выпадают из последующих обновлений.

При запущенном приложении синхронизация выполняется командой:

```bash
export NUXT_SYNC_SECRET="$(grep NUXT_SYNC_SECRET .env | cut -d= -f2 | tr -d '\"')"
npm run sync:matches
```

Dev-сервер слушает `0.0.0.0:3000`. Для другого адреса задайте:

```bash
NUXT_APP_URL="http://localhost:3001"
```
