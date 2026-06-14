# VPS cron

Use this if you want a strict schedule outside GitHub Actions.

## 1. Copy the script to the VPS

```bash
mkdir -p /opt/football-predictions
cp sync-matches.sh /opt/football-predictions/sync-matches.sh
chmod +x /opt/football-predictions/sync-matches.sh
```

## 2. Install prerequisites

On Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y curl util-linux
```

## 3. Set environment variables

Create a file such as `/etc/football-predictions.env`:

```bash
SYNC_SECRET="your-sync-secret"
APP_URL="https://your-app.vercel.app"
```

## 4. Add cron

Edit crontab:

```bash
crontab -e
```

Add:

```cron
*/5 * * * * /usr/bin/flock -n /tmp/football-sync.lock /bin/bash -lc 'source /etc/football-predictions.env && /opt/football-predictions/sync-matches.sh' >> /var/log/football-sync.log 2>&1
```

## 5. Verify

Run once manually:

```bash
source /etc/football-predictions.env
/opt/football-predictions/sync-matches.sh
```

Check the log:

```bash
tail -n 50 /var/log/football-sync.log
```
