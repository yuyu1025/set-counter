# SETS / 计组

Gym-floor set counter. Type the lift, set reps or hold time, tap to log a set. Rest countdown starts automatically. Data stays in the browser.

Live: [sets.distinctive.fun](https://sets.distinctive.fun)

## Use

1. Enter an exercise, or pick a preset.
2. Set reps per set, or switch to **Hold** for planks and other timed work.
3. Set seconds: rest after a reps set, or hold length in timed mode.
4. Tap **Log set**. The app counts sets, volume (`sets × reps`), and session time.
5. Skip rest if you are ready early. Undo the last set if you mis-tapped.

Language follows the device (`zh*` → Chinese, otherwise English). English is the default when no language info is available. The EN / 中 toggle is stored locally.

## Stack

- Next.js static export (`output: "export"`)
- Cloudflare Pages
- GitHub Actions via `wrangler pages deploy`
- Cloudflare Web Analytics

## Local

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
```

Static files land in `out/`.

## Deploy

Push to `main`. The workflow builds and deploys to the `set-counter` Pages project.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN` — Account / Cloudflare Pages / Edit
- `CLOUDFLARE_ACCOUNT_ID` — `d68615c4b79a81e7cf83dff92d97560a`
- `NEXT_PUBLIC_CF_BEACON_TOKEN` — optional; used if auto-injection is off

Custom domain: `sets.distinctive.fun`

```txt
Type    Name    Content                  Proxy
CNAME   sets    set-counter.pages.dev    orange cloud
```

If you have a token with Zone DNS Edit and Account RUM Edit:

```bash
CLOUDFLARE_API_TOKEN=... node scripts/setup-cloudflare.mjs
```
