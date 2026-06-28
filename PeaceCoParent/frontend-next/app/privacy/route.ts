export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Privacy Policy | PeaceCoParent</title>
  <meta name="description" content="How PeaceCoParent collects, uses, and protects your data."/>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..600&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#F1ECDF;--bg-soft:#F7F3E9;--card:#FFFEFA;
      --green:#1E3F2C;--green-deep:#14301F;--green-tint:#D5DECA;
      --ink:#16201A;--ink-soft:#4A5550;--ink-mute:#7B847E;
      --clay:#C76A3F;--clay-soft:#E89968;
      --warn:#B84B2C;--border:#E1D9C6;
      --serif:"Newsreader",Georgia,serif;--sans:"Manrope",system-ui,sans-serif;--mono:"JetBrains Mono",monospace;
    }
    body{font-family:var(--sans);background:var(--bg);color:var(--ink-soft);font-size:15px;line-height:1.7;-webkit-font-smoothing:antialiased}
    a{color:var(--green);text-underline-offset:2px}
    header{display:flex;align-items:center;justify-content:space-between;padding:22px 56px;border-bottom:1px solid var(--border);background:var(--bg)}
    .logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink)}
    .logo-icon{width:40px;height:40px;border-radius:11px;background:var(--green);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:22px;color:#F1ECDF}
    .logo-name{font-family:var(--sans);font-size:16px;font-weight:700;letter-spacing:-0.02em;color:var(--ink)}
    .back{font-size:13.5px;color:var(--green);font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
    main{max-width:820px;margin:0 auto;padding:72px 56px 100px}
    .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:500;color:var(--clay)}
    h1{font-family:var(--serif);font-weight:400;font-size:clamp(48px,7vw,80px);line-height:0.98;letter-spacing:-0.035em;margin:18px 0 24px;color:var(--ink)}
    .lead{font-size:17px;line-height:1.55;color:var(--ink-soft);margin-bottom:48px}
    .sections{display:flex;flex-direction:column;gap:36px}
    .sec{display:grid;grid-template-columns:48px 1fr;gap:24px}
    .sec-n{font-family:var(--mono);font-size:13px;font-weight:700;color:var(--clay);letter-spacing:.04em;padding-top:4px}
    .sec h2{font-family:var(--serif);font-size:26px;letter-spacing:-0.015em;margin-bottom:12px;font-weight:400;color:var(--ink)}
    .sec p,.sec li{font-size:15px;line-height:1.65;color:var(--ink-soft)}
    .sec ul{padding-left:20px;display:grid;gap:8px;margin-top:8px}
    .def-list{display:grid;gap:8px}
    .def-row{font-size:15px;line-height:1.55;color:var(--ink-soft)}
    .def-key{color:var(--ink);font-weight:600}
    footer{border-top:1px solid var(--border);padding:28px 56px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:var(--mono);font-size:11.5px;color:var(--ink-mute);letter-spacing:.04em}
    footer a{color:inherit;text-decoration:none;opacity:0.8}
    @media(max-width:640px){header,main,footer{padding-left:24px;padding-right:24px}.sec{grid-template-columns:1fr}.sec-n{display:none}}
  </style>
</head>
<body>
  <header>
    <a href="/" class="logo">
      <div class="logo-icon">P</div>
      <span class="logo-name">PeaceCoParent</span>
    </a>
    <a href="/" class="back">← Back to peacecoparent.com</a>
  </header>

  <main>
    <div class="eyebrow">Trust · last updated April 27, 2026</div>
    <h1>Privacy <em>policy.</em></h1>
    <p class="lead">We collect what we need to make the product work, encrypt the rest, and never sell anything. The short version is on this page.</p>

    <div class="sections">
      <div class="sec"><div class="sec-n">01</div><div>
        <h2>Who we are</h2>
        <p>PeaceCoParent ("we", "us", "our") is a co-parenting communication platform available at <strong>peacecoparent.com</strong>. We help separated parents communicate, track expenses, and manage custody schedules in a documented, tamper-evident environment.</p>
        <p style="margin-top:8px">Contact: <a href="mailto:hello@peacecoparent.com">hello@peacecoparent.com</a></p>
      </div></div>

      <div class="sec"><div class="sec-n">02</div><div>
        <h2>What data we collect</h2>
        <div class="def-list">
          <div class="def-row"><span class="def-key">Account data:</span> Name, email, password (hashed — never stored in plain text).</div>
          <div class="def-row"><span class="def-key">Family data:</span> Family name, invite codes, parent roles.</div>
          <div class="def-row"><span class="def-key">Messages:</span> All messages sent through the platform (required for tamper-proof records).</div>
          <div class="def-row"><span class="def-key">Expenses:</span> Submissions, amounts, categories, receipts, payment status.</div>
          <div class="def-row"><span class="def-key">Calendar events:</span> Custody schedule, pickups, appointments.</div>
          <div class="def-row"><span class="def-key">Documents:</span> Files you upload (stored on secure cloud storage).</div>
          <div class="def-row"><span class="def-key">Child profiles:</span> Names, dates of birth, medical and school info — entered voluntarily by you.</div>
          <div class="def-row"><span class="def-key">Payment data:</span> Processed by Stripe. We never see or store your card details.</div>
          <div class="def-row"><span class="def-key">Usage data:</span> Server-side logs (errors, performance) to improve the product — no third-party tracking.</div>
          <div class="def-row"><span class="def-key">Push tokens:</span> To send you alerts on your device.</div>
        </div>
      </div></div>

      <div class="sec"><div class="sec-n">03</div><div>
        <h2>Why we collect it (legal basis)</h2>
        <div class="def-list">
          <div class="def-row"><span class="def-key">Contract performance:</span> To provide the service you signed up for.</div>
          <div class="def-row"><span class="def-key">Legitimate interest:</span> To improve the product and prevent abuse.</div>
          <div class="def-row"><span class="def-key">Legal obligation:</span> To comply with applicable laws.</div>
          <div class="def-row"><span class="def-key">Consent:</span> For push notifications and marketing emails (you can opt out any time).</div>
        </div>
      </div></div>

      <div class="sec"><div class="sec-n">04</div><div>
        <h2>How we use your data</h2>
        <ul>
          <li>To provide and operate the PeaceCoParent service.</li>
          <li>To send you transactional emails (password reset, expense notifications).</li>
          <li>To generate court reports upon your request.</li>
          <li>To process payments via Stripe.</li>
          <li>To provide message coaching (message content is sent to the coaching service with sender names anonymised).</li>
          <li>We <strong>never sell your data</strong> to third parties.</li>
        </ul>
      </div></div>

      <div class="sec"><div class="sec-n">05</div><div>
        <h2>Data sharing</h2>
        <p>We share data only with the following trusted processors:</p>
        <div class="def-list" style="margin-top:12px">
          <div class="def-row"><span class="def-key">Neon (PostgreSQL):</span> Database hosting (EU/US).</div>
          <div class="def-row"><span class="def-key">Vercel:</span> Hosting and serverless functions.</div>
          <div class="def-row"><span class="def-key">Railway:</span> Backend hosting.</div>
          <div class="def-row"><span class="def-key">Stripe:</span> Payment processing.</div>
          <div class="def-row"><span class="def-key">Resend:</span> Transactional email delivery.</div>
          <div class="def-row"><span class="def-key">AWS S3:</span> Document file storage.</div>
          <div class="def-row"><span class="def-key">Coaching service:</span> message coaching — message content is transmitted with sender names replaced by "Parent A" / "Parent B".</div>
        </div>
      </div></div>

      <div class="sec"><div class="sec-n">06</div><div>
        <h2>Data retention</h2>
        <p>We retain your data for as long as your account is active. Messages, expenses and calendar events are retained indefinitely to ensure tamper-proof court records. When you delete your account, your profile, name, and contact details are permanently deleted within 30 days. Messages, expenses, and calendar events that form part of a shared tamper-proof record are retained in anonymised form to preserve record integrity for the other party.</p>
      </div></div>

      <div class="sec"><div class="sec-n">07</div><div>
        <h2>Your rights (GDPR)</h2>
        <p>If you are in the EU/EEA/UK, you have the right to access, rectify, erase, port, and object to your data processing. To exercise any right, email <a href="mailto:hello@peacecoparent.com">hello@peacecoparent.com</a>.</p>
      </div></div>

      <div class="sec"><div class="sec-n">08</div><div>
        <h2>Security</h2>
        <p>All data is encrypted in transit (TLS) and at rest. Passwords are hashed with bcrypt. Access tokens expire after 15 minutes.</p>
      </div></div>

      <div class="sec"><div class="sec-n">09</div><div>
        <h2>Children's privacy</h2>
        <p>PeaceCoParent is designed for use by adults. We do not knowingly collect data directly from children under 13.</p>
      </div></div>

      <div class="sec"><div class="sec-n">10</div><div>
        <h2>Changes to this policy</h2>
        <p>We may update this policy. We will notify you by email and update the "Last updated" date above.</p>
      </div></div>
    </div>
  </main>

  <footer>
    <div>© 2026 PeaceCoParent</div>
    <div><a href="/terms">Terms of Service</a> &nbsp;·&nbsp; <a href="/">peacecoparent.com</a></div>
  </footer>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
