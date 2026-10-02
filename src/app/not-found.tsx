"use client";

import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Page Not Found · Lumière</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          :root { --bg: #faf7f2; --fg: #1a1a1a; --accent: #c9a961; --accent-dark: #a88847; --muted: #6b6b6b; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: system-ui, -apple-system, "Segoe UI", Tahoma, Arial, sans-serif;
            background: var(--bg); color: var(--fg);
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            padding: 2rem 1rem; line-height: 1.6;
          }
          .container { max-width: 32rem; width: 100%; text-align: center; }
          .logo {
            display: inline-block; font-size: 1.875rem; font-weight: 700;
            color: var(--accent); text-decoration: none;
            margin-bottom: 2.5rem; letter-spacing: 1px; transition: color .15s;
          }
          .logo:hover { color: var(--accent-dark); }
          .code {
            font-size: 5rem; font-weight: 700; color: rgba(201,169,97,0.3);
            line-height: 1; margin-bottom: 1rem;
            font-family: 'Consolas', 'Monaco', monospace;
          }
          h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
          p { color: var(--muted); margin-bottom: 2.5rem; font-size: 0.95rem; }
          .buttons {
            display: flex; flex-direction: column; gap: 0.75rem;
            align-items: center; justify-content: center;
          }
          @media (min-width: 640px) { .buttons { flex-direction: row; } }
          .btn {
            display: inline-block; padding: 0.75rem 2rem;
            border-radius: 999px; font-weight: 500; font-size: 0.95rem;
            text-decoration: none; cursor: pointer; transition: all .15s;
            border: 2px solid transparent; width: 100%; max-width: 20rem; text-align: center;
            font-family: inherit;
          }
          @media (min-width: 640px) { .btn { width: auto; max-width: none; } }
          .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
          .btn-primary:hover { background: var(--accent-dark); border-color: var(--accent-dark); }
          .btn-secondary { background: transparent; color: var(--accent); border-color: var(--accent); }
          .btn-secondary:hover { background: var(--accent); color: #fff; }
          .lang-block {
            margin-top: 2rem; padding-top: 2rem;
            border-top: 1px solid rgba(229,221,208,0.6);
            direction: rtl;
          }
          .lang-label {
            font-size: 0.65rem; text-transform: uppercase;
            letter-spacing: 0.2em; color: rgba(107,107,107,0.5);
            margin-bottom: 0.75rem;
          }
          .lang-block h2 {
            font-size: 1rem; font-weight: 500;
            color: var(--muted); margin-bottom: 0.375rem;
          }
          .lang-block p {
            font-size: 0.875rem;
            color: rgba(107,107,107,0.8);
            margin-bottom: 0;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <Link href="/" className="logo">
            Lumière
          </Link>

          <div className="code">404</div>

          <h1>Page Not Found</h1>
          <p>
            The link you&apos;re looking for may be broken or the page has been
            removed. Don&apos;t worry — you can go back or return to the homepage.
          </p>

          <div className="lang-block">
            <div className="lang-label">العربية</div>
            <h2>الصفحة غير موجودة</h2>
            <p>
              يبدو أن الرابط الذي تبحث عنه غير صحيح أو تم حذفه. لا تقلق — يمكنك
              العودة للخلف أو إلى الصفحة الرئيسية.
            </p>
          </div>

          <div className="buttons">
            <Link href="/" className="btn btn-primary">
              Return Home · الصفحة الرئيسية
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn btn-secondary"
            >
              Go Back · العودة للخلف
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}