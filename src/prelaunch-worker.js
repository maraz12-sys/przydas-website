const HOLDING_PAGE = `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <meta name="theme-color" content="#087f53" />
    <meta name="color-scheme" content="light" />
    <title>Przydaś — już za chwilę startujemy</title>
    <link rel="icon" href="/przydas-mark.svg" type="image/svg+xml" />
    <style>
      :root {
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #14352a;
        background: #f4f8f6;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; }
      body {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 24px;
        overflow: hidden;
        background:
          radial-gradient(circle at 18% 15%, rgba(20, 148, 103, .14), transparent 32rem),
          radial-gradient(circle at 88% 85%, rgba(20, 148, 103, .10), transparent 28rem),
          #f4f8f6;
      }
      .orb {
        position: fixed;
        border-radius: 999px;
        filter: blur(2px);
        pointer-events: none;
      }
      .orb.one {
        width: 240px;
        height: 240px;
        left: -90px;
        bottom: -70px;
        background: rgba(8, 127, 83, .08);
      }
      .orb.two {
        width: 180px;
        height: 180px;
        right: -55px;
        top: -45px;
        background: rgba(8, 127, 83, .07);
      }
      main {
        position: relative;
        width: min(720px, 100%);
        text-align: center;
      }
      .logo {
        width: 74px;
        height: 74px;
        display: block;
        margin: 0 auto 22px;
        filter: drop-shadow(0 12px 24px rgba(8, 127, 83, .12));
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid rgba(8, 127, 83, .16);
        border-radius: 999px;
        background: rgba(255,255,255,.76);
        color: #087f53;
        font-size: 12px;
        font-weight: 850;
        letter-spacing: .08em;
        text-transform: uppercase;
        box-shadow: 0 8px 28px rgba(28, 74, 57, .06);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #159467;
        box-shadow: 0 0 0 5px rgba(21, 148, 103, .10);
        animation: pulse 1.8s ease-in-out infinite;
      }
      h1 {
        margin: 22px 0 14px;
        color: #113f30;
        font-size: clamp(40px, 8vw, 72px);
        line-height: .98;
        letter-spacing: -.055em;
      }
      p {
        max-width: 590px;
        margin: 0 auto;
        color: #5c7068;
        font-size: clamp(16px, 2.5vw, 20px);
        line-height: 1.6;
      }
      .brand {
        margin-top: 34px;
        color: #087f53;
        font-size: 14px;
        font-weight: 850;
        letter-spacing: .02em;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(.72); opacity: .6; }
      }
      @media (prefers-reduced-motion: reduce) {
        .dot { animation: none; }
      }
    </style>
  </head>
  <body>
    <div class="orb one" aria-hidden="true"></div>
    <div class="orb two" aria-hidden="true"></div>
    <main>
      <img class="logo" src="/przydas-mark.svg" alt="Przydaś" />
      <div class="badge"><span class="dot" aria-hidden="true"></span>Start już wkrótce</div>
      <h1>Już za chwilę startujemy.</h1>
      <p>Kończymy ostatnie przygotowania. Pełna strona Przydasia pojawi się tutaj wraz z oficjalnym startem.</p>
      <div class="brand">PRZYDAŚ · mniej zamieszania, więcej zarabiania</div>
    </main>
  </body>
</html>`;

const HOLDING_HEADERS = {
  "Content-Type": "text/html; charset=UTF-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
};

export default {
  async fetch(request, env) {
    if (String(env.PRELAUNCH_MODE || "").toLowerCase() === "true") {
      return new Response(HOLDING_PAGE, {
        status: 200,
        headers: HOLDING_HEADERS,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
