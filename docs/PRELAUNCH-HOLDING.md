# Prelaunch holding screen

Production marketing homepage is temporarily intercepted by `src/prelaunch-worker.js`.

The complete launch-ready Astro site remains unchanged in `src/pages/index.astro` and the rest of `src/`.

Configuration lives in `wrangler.jsonc`:

```jsonc
"vars": {
  "PRELAUNCH_MODE": "true"
}
```

## Official launch

Change `PRELAUNCH_MODE` from `"true"` to `"false"` and deploy. The Worker will immediately pass `/` back to the existing static Astro homepage through the `ASSETS` binding.

The holding response uses `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow, noarchive` so the switch back to the marketing site is not held by browser/CDN cache and the temporary page is not intended for indexing.

Public reservation forms and all non-root routes are served normally because `assets.run_worker_first` only intercepts `/` and `/index.html`.
