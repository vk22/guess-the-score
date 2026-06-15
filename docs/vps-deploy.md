# VPS deploy

This setup runs the Nuxt app and PostgreSQL directly on a VPS with Docker.

The app already runs its own sync timer every 10 minutes on self-hosted
environments. Keep `NUXT_DISABLE_SYNC_CRON` unset for a single VPS process.
Set it to `true` only if you prefer an external cron job.

## 1. Prepare files

Copy these files to the VPS:

- `Dockerfile`
- `docker-compose.vps.yml`
- `.env`
- `ops/sync-matches.sh`
- `/etc/football-predictions.env` for the cron job

## 2. Fill env

Set strong values in `.env`:

- `NUXT_SESSION_PASSWORD`
- `NUXT_SYNC_SECRET`
- `NUXT_FOOTBALL_DATA_API_KEY`

## 3. Start services

```bash
docker compose -f docker-compose.vps.yml up -d --build
```

## 4. Restore data

If you already have a dump:

```bash
docker cp football.dump football-predictions-postgres-1:/tmp/football.dump
docker exec -it football-predictions-postgres-1 pg_restore --clean --if-exists --no-owner --no-privileges -U football_user -d football_predictions /tmp/football.dump
```

If you prefer, you can also stream the dump directly:

```bash
cat football.dump | docker exec -i football-predictions-postgres-1 pg_restore --clean --if-exists --no-owner --no-privileges -U football_user -d football_predictions
```

## 5. Check the app

Open:

```text
http://YOUR_VPS_IP:4200
```

## 6. Cron

You do not need an extra host cron if the app container runs continuously.

If you want an external cron instead, set `NUXT_DISABLE_SYNC_CRON=true` in
the app environment and use the host script in `docs/vps-cron.md`.

See `docs/vps-cron.md`.
