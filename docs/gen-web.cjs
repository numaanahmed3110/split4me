const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const outDir = path.join(root, 'ui-mocks', 'web');
fs.mkdirSync(outDir, { recursive: true });

/* ============================================================
   WEB DESIGN SYSTEM (same philosophy as PWA: Poppins, pastel
   yellow/purple/teal, large radii, pill buttons, stacked cards,
   soft shadows — but laid out for desktop / web view).
   ============================================================ */
const WEB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

:root{
  --bg:#EBEBEB;
  --card:#FFFFFF;
  --text:#1C1C1E;
  --muted:#9CA3AF;
  --success:#16A34A;
  --danger:#DC2626;
  --yellow:#FDECAD;  --yellow-d:#E6D799;
  --purple:#D8CEFA;  --purple-l:#E8E2FC;
  --teal:#E0F4F5;    --teal-d:#CDE6E8;
  --dark:#1D1C22;
  --line:rgba(28,28,30,0.08);
  --shadow:0 24px 60px rgba(0,0,0,0.07);
  --shadow-sm:0 8px 24px rgba(0,0,0,0.05);
  --r:28px; --r-lg:36px; --pill:100px;
  --maxw:1180px;
}

*{margin:0;padding:0;box-sizing:border-box;font-family:'Poppins',sans-serif;-webkit-font-smoothing:antialiased;}
:focus-visible{outline:2px solid var(--text-dark);outline-offset:2px;border-radius:inherit;}
body{background:var(--bg);color:var(--text);line-height:1.5;}
a{text-decoration:none;color:inherit;}
button{font-family:inherit;border:none;cursor:pointer;outline:none;}

.wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px;}
.center{text-align:center;}

/* ---------- Top Nav ---------- */
.wnav{position:sticky;top:0;z-index:60;background:rgba(244,241,234,0.78);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);}
.wnav-in{max-width:var(--maxw);margin:0 auto;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:24px;}
.wlogo{font-weight:800;font-size:20px;display:flex;align-items:center;gap:10px;letter-spacing:-0.5px;}
.wlogo .mark{width:34px;height:34px;border-radius:11px;background:var(--yellow);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:var(--shadow-sm);}
.wlinks{display:flex;gap:30px;font-size:14px;font-weight:500;color:var(--muted);}
.wlinks a:hover{color:var(--text);}
.wnav-cta{display:flex;gap:12px;align-items:center;}
.wtoggle{width:42px;height:42px;border-radius:50%;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:var(--shadow-sm);}

/* ---------- Buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--pill);font-weight:600;font-size:14px;padding:14px 26px;transition:.18s;white-space:nowrap;}
.btn:hover{transform:translateY(-1px);}
.btn-primary{background:var(--purple);color:var(--text);box-shadow:var(--shadow-sm);} .btn-primary:hover{background:#c9bdf6;}
.btn-dark{background:var(--dark);color:#fff;box-shadow:var(--shadow-sm);} .btn-dark:hover{background:#000;}
.btn-yellow{background:var(--yellow);color:var(--text);box-shadow:var(--shadow-sm);} .btn-yellow:hover{background:var(--yellow-d);}
.btn-teal{background:var(--teal);color:var(--text);box-shadow:var(--shadow-sm);}
.btn-outline{background:transparent;border:1.5px solid rgba(28,28,30,0.14);color:var(--text);} .btn-outline:hover{background:#fff;}
.btn-ghost{background:transparent;color:var(--muted);} .btn-ghost:hover{color:var(--text);}
.btn-lg{padding:17px 34px;font-size:15px;}
.btn-sm{padding:10px 18px;font-size:13px;}

/* ---------- Cards & chips ---------- */
.card{background:var(--card);border-radius:var(--r);box-shadow:var(--shadow);padding:26px;}
.card-lg{border-radius:var(--r-lg);}
.chip{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--pill);font-size:12px;font-weight:600;}
.chip-y{background:var(--yellow);} .chip-p{background:var(--purple);} .chip-t{background:var(--teal);}
.chip-soft{background:rgba(28,28,30,0.05);color:var(--muted);}
.pill-stat{background:rgba(216,206,250,0.35);border-radius:var(--pill);padding:8px 18px;font-weight:600;font-size:13px;}

.section{padding:90px 0;}
.eyebrow{text-transform:uppercase;letter-spacing:2px;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:14px;}
h1.h-hero{font-size:clamp(38px,5vw,62px);line-height:1.05;letter-spacing:-1.5px;font-weight:700;}
h2.h-sec{font-size:clamp(30px,4vw,44px);line-height:1.1;letter-spacing:-1px;font-weight:700;}
.lead{font-size:18px;color:var(--muted);max-width:640px;margin:0 auto;}

.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.avatar-sm{width:32px;height:32px;font-size:14px;} .avatar-lg{width:52px;height:52px;font-size:24px;}

/* ---------- Hero ---------- */
.hero{position:relative;padding:70px 0 90px;overflow:hidden;}
.hero-grid{display:grid;grid-template-columns:1.05fr 0.95fr;gap:40px;align-items:center;}
.hero-visual{position:relative;height:480px;}
.float-card{position:absolute;background:#fff;border-radius:24px;box-shadow:var(--shadow);padding:18px;}
.fcy{top:30px;right:10px;background:var(--yellow);width:230px;}
.fcp{top:200px;left:0;background:var(--purple);width:210px;}
.fct{bottom:10px;right:60px;background:var(--teal);width:200px;}
.hero-blob{position:absolute;border-radius:50%;filter:blur(8px);opacity:0.55;}
.blob1{width:160px;height:160px;background:var(--purple);top:-10px;right:140px;}
.blob2{width:120px;height:120px;background:var(--teal);bottom:60px;left:120px;}

.logos{display:flex;gap:46px;justify-content:center;align-items:center;flex-wrap:wrap;opacity:0.6;padding:30px 0;}
.logos span{font-weight:700;font-size:18px;color:var(--muted);letter-spacing:-0.5px;}

/* ---------- Feature grid ---------- */
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;}
.feature{padding:30px;border-radius:var(--r);background:#fff;box-shadow:var(--shadow-sm);border:1px solid var(--line);transition:.2s;}
.feature:hover{transform:translateY(-4px);box-shadow:var(--shadow);}
.feature .ficon{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:18px;}
.feature h3{font-size:19px;font-weight:600;margin-bottom:8px;}
.feature p{font-size:14px;color:var(--muted);}

/* ---------- Stats row ---------- */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;}
.stat{text-align:center;}
.stat .num{font-size:42px;font-weight:800;letter-spacing:-1px;}
.stat .lbl{font-size:14px;color:var(--muted);}

/* ---------- Steps ---------- */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;counter-reset:step;}
.step{position:relative;padding:32px 28px;border-radius:var(--r);background:#fff;box-shadow:var(--shadow-sm);}
.step .n{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;margin-bottom:16px;}
.step h3{font-size:18px;font-weight:600;margin-bottom:8px;}
.step p{font-size:14px;color:var(--muted);}

/* ---------- Testimonials ---------- */
.quote{padding:30px;border-radius:var(--r);background:#fff;box-shadow:var(--shadow-sm);}
.quote p{font-size:15px;margin-bottom:18px;}
.quote .who{display:flex;align-items:center;gap:12px;font-size:14px;}
.quote .who b{font-weight:600;}

/* ---------- CTA band ---------- */
.cta-band{background:var(--dark);color:#fff;border-radius:var(--r-lg);padding:64px 48px;text-align:center;position:relative;overflow:hidden;}
.cta-band h2{color:#fff;font-size:clamp(28px,4vw,42px);font-weight:700;letter-spacing:-1px;margin-bottom:14px;}
.cta-band p{color:rgba(255,255,255,0.7);max-width:560px;margin:0 auto 28px;font-size:16px;}

/* ---------- Footer ---------- */
.foot{background:#fff;border-top:1px solid var(--line);padding:56px 0 30px;}
.foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:30px;margin-bottom:40px;}
.foot h4{font-size:14px;font-weight:600;margin-bottom:14px;}
.foot a{display:block;font-size:14px;color:var(--muted);margin-bottom:10px;}
.foot a:hover{color:var(--text);}
.foot-bottom{border-top:1px solid var(--line);padding-top:20px;display:flex;justify-content:space-between;font-size:13px;color:var(--muted);flex-wrap:wrap;gap:10px;}

/* ============================================================
   WEB APP SHELL (dashboard / screens 7-22)
   ============================================================ */
.app{display:grid;grid-template-columns:248px 1fr;min-height:100vh;}
.sidebar{background:#fff;border-right:1px solid var(--line);padding:24px 18px;display:flex;flex-direction:column;gap:6px;position:sticky;top:0;height:100vh;}
.sidebar .wlogo{margin-bottom:24px;padding-left:8px;}
.snav{display:flex;flex-direction:column;gap:4px;}
.snav a{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;font-size:14px;font-weight:500;color:var(--muted);transition:.15s;}
.snav a .ic{font-size:18px;}
.snav a:hover{background:var(--bg);color:var(--text);}
.snav a.active{background:var(--bg);color:var(--text);font-weight:600;}
.snav .grp{margin-top:18px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:700;padding:0 14px 8px;}
.side-foot{margin-top:auto;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:var(--bg);}

.main{padding:28px 36px 60px;max-width:1100px;width:100%;}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:28px;flex-wrap:wrap;}
.topbar h1{font-size:26px;font-weight:700;letter-spacing:-0.5px;}
.topbar .actions{display:flex;gap:10px;align-items:center;}
.search{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:var(--pill);padding:11px 18px;font-size:14px;color:var(--muted);min-width:240px;box-shadow:var(--shadow-sm);}
.group-chip{display:inline-flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:var(--pill);padding:8px 16px 8px 8px;font-weight:600;font-size:14px;box-shadow:var(--shadow-sm);}

/* summary cards */
.sum-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:26px;}
.sum{background:#fff;border-radius:var(--r);box-shadow:var(--shadow-sm);padding:24px;border:1px solid var(--line);}
.sum .lbl{font-size:13px;color:var(--muted);margin-bottom:8px;}
.sum .val{font-size:34px;font-weight:800;letter-spacing:-1px;}
.sum .sub{font-size:13px;color:var(--muted);margin-top:6px;}

/* group cards */
.group-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.gcard{background:#fff;border-radius:var(--r);box-shadow:var(--shadow-sm);overflow:hidden;border:1px solid var(--line);transition:.2s;cursor:pointer;}
.gcard:hover{transform:translateY(-4px);box-shadow:var(--shadow);}
.gcard .top{height:96px;display:flex;align-items:flex-end;padding:18px;}
.gcard .body{padding:18px;}
.gcard h3{font-size:17px;font-weight:600;margin-bottom:4px;}
.gcard .meta{font-size:13px;color:var(--muted);display:flex;justify-content:space-between;}

/* lists / rows */
.list{background:#fff;border-radius:var(--r);box-shadow:var(--shadow-sm);border:1px solid var(--line);overflow:hidden;}
.row{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--line);}
.row:last-child{border-bottom:none;}
.row .grow{flex:1;}
.row .t{font-weight:600;font-size:15px;}
.row .s{font-size:13px;color:var(--muted);}
.row .amt{font-weight:700;font-size:15px;}

/* tabs */
.tabs{display:inline-flex;background:#fff;border:1px solid var(--line);border-radius:var(--pill);padding:5px;gap:4px;box-shadow:var(--shadow-sm);margin-bottom:24px;}
.tabs a{padding:10px 20px;border-radius:var(--pill);font-size:14px;font-weight:500;color:var(--muted);}
.tabs a.active{background:var(--purple);color:var(--text);font-weight:600;}

/* forms */
.form-card{background:#fff;border-radius:var(--r);box-shadow:var(--shadow);padding:34px;max-width:560px;}
.field{margin-bottom:20px;}
.field label{display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text);}
.field input,.field select,.field textarea{width:100%;border:1px solid var(--line);border-radius:16px;padding:14px 16px;font-size:14px;font-family:inherit;background:#fff;color:var(--text);}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--purple);box-shadow:0 0 0 4px rgba(216,206,250,0.4);}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}

/* balances / avatars stack */
.av-stack{display:flex;}
.av-stack .avatar{border:3px solid #fff;margin-left:-12px;}
.av-stack .avatar:first-child{margin-left:0;}

/* charts (pure CSS) */
.bars{display:flex;align-items:flex-end;gap:14px;height:200px;padding:10px 4px 0;}
.bar{flex:1;background:var(--purple);border-radius:12px 12px 0 0;position:relative;}
.bar.y{background:var(--yellow);} .bar.t{background:var(--teal);}
.bar .bl{position:absolute;bottom:-26px;left:0;right:0;text-align:center;font-size:12px;color:var(--muted);}
.legend{display:flex;gap:18px;justify-content:center;margin-top:36px;font-size:13px;color:var(--muted);}
.legend i{width:12px;height:12px;border-radius:4px;display:inline-block;margin-right:6px;vertical-align:middle;}

/* split sliders */
.slider-row{display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid var(--line);}
.slider-row .name{flex:1;font-weight:600;font-size:15px;}
.slider-row input[type=range]{flex:1;accent-color:#1D1C22;}
.slider-row .val{width:80px;text-align:right;font-weight:700;}

/* receipt */
.receipt{background:#fff;border-radius:var(--r);box-shadow:var(--shadow);padding:28px;max-width:420px;}
.receipt .rline{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed var(--line);font-size:15px;}
.receipt .rtot{display:flex;justify-content:space-between;padding-top:16px;font-weight:800;font-size:20px;}

/* mode cards */
.mode{display:flex;align-items:center;gap:16px;padding:20px;border:2px solid var(--line);border-radius:20px;cursor:pointer;transition:.15s;background:#fff;}
.mode.active{border-color:var(--purple);background:var(--purple-l);}
.mode .mi{width:46px;height:46px;border-radius:14px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:22px;}
.mode h4{font-size:16px;font-weight:600;} .mode p{font-size:13px;color:var(--muted);}

/* empty state */
.empty{text-align:center;padding:70px 20px;}
.empty .ic{width:88px;height:88px;border-radius:28px;background:var(--purple-l);display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 22px;}
.empty h3{font-size:22px;font-weight:600;margin-bottom:8px;}
.empty p{color:var(--muted);margin-bottom:22px;}

/* ---------- Dark app theme (screen 22) ---------- */
.dark-app{--bg:#15141A;--card:#1F1E26;--text:#F4F1EA;--muted:#9A97A6;--line:rgba(255,255,255,0.08);--shadow:0 24px 60px rgba(0,0,0,0.4);--shadow-sm:0 8px 24px rgba(0,0,0,0.3);}
.dark-app .wnav{background:rgba(21,20,26,0.8);border-color:var(--line);}
.dark-app .side{background:#191820;border-color:var(--line);}
.dark-app .snav a:hover,.dark-app .snav a.active{background:#26242F;color:#fff;}
.dark-app .side-foot{background:#26242F;}
.dark-app .search,.dark-app .group-chip,.dark-app .tabs,.dark-app .form-card,.dark-app .list,.dark-app .sum,.dark-app .gcard,.dark-app .card,.dark-app .quote,.dark-app .feature,.dark-app .step{border-color:var(--line);}
.dark-app .field input,.dark-app .field select,.dark-app .field textarea{background:#26242F;border-color:var(--line);color:#fff;}

/* ---------- Preview page chrome ---------- */
.prev-body{background:#15141A;padding:40px 20px;}
.prev-nav{position:sticky;top:0;z-index:100;background:rgba(21,20,26,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 28px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.prev-nav a{color:rgba(255,255,255,0.5);font-size:12px;font-weight:500;padding:7px 14px;border-radius:100px;transition:.2s;}
.prev-nav a:hover{color:#fff;background:rgba(255,255,255,0.08);}
.prev-nav .lab{color:rgba(255,255,255,0.25);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-right:8px;}
.wsec{margin-bottom:70px;scroll-margin-top:80px;}
.wlabel{color:rgba(255,255,255,0.3);font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-align:center;margin-bottom:22px;}
.wlabel span{color:rgba(255,255,255,0.7);font-size:14px;letter-spacing:0;text-transform:none;display:block;margin-top:4px;}

@media (max-width:980px){
  .hero-grid,.grid-3,.grid-2,.sum-grid,.group-grid,.stats-row,.steps{grid-template-columns:1fr;}
  .app{grid-template-columns:1fr;} .sidebar{display:none;}
  .wlinks{display:none;}
  .two-col{grid-template-columns:1fr;}
}
`;

/* ---------- Reusable nav for standalone files ---------- */
const NAV = `
<nav class="wnav"><div class="wnav-in">
  <a class="wlogo" href="#"><span class="mark">💸</span> split4me</a>
  <div class="wlinks"><a href="#">Features</a><a href="#">How it works</a><a href="#">Pricing</a><a href="#">About</a></div>
  <div class="wnav-cta"><a class="btn btn-ghost" href="#">Sign in</a><a class="btn btn-dark" href="#">Get started</a></div>
</div></nav>`;

const FOOTER = `
<footer class="foot"><div class="wrap">
  <div class="foot-grid">
    <div><a class="wlogo" href="#" style="margin-bottom:14px"><span class="mark">💸</span> split4me</a>
      <p style="font-size:14px;color:var(--muted);max-width:260px">Split bills, track shared expenses and settle up — without the awkward maths.</p></div>
    <div><h4>Product</h4><a href="#">Features</a><a href="#">Pricing</a><a href="#">Download</a><a href="#">Changelog</a></div>
    <div><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Careers</a><a href="#">Contact</a></div>
    <div><h4>Legal</h4><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a></div>
  </div>
  <div class="foot-bottom"><span>© 2025 split4me. All rights reserved.</span><span>Made with 💜 for fair splits.</span></div>
</div></footer>`;

/* ---------- Reusable web app shell for screens 7-22 ---------- */
function appShell(active, topbar, main, dark=false){
  const cls = 'app' + (dark ? ' dark-app' : '');
  return `
<div class="${cls}">
  <aside class="sidebar side">
    <a class="wlogo" href="#"><span class="mark">💸</span> split4me</a>
    <nav class="snav">
      <a class="${active==='dash'?'active':''}" href="#"><span class="ic">🏠</span> Dashboard</a>
      <a class="${active==='exp'?'active':''}" href="#"><span class="ic">🧾</span> Expenses</a>
      <a class="${active==='bal'?'active':''}" href="#"><span class="ic">⚖️</span> Balances</a>
      <a class="${active==='act'?'active':''}" href="#"><span class="ic">📈</span> Activity</a>
      <a class="${active==='stat'?'active':''}" href="#"><span class="ic">📊</span> Statistics</a>
      <div class="grp">Groups</div>
      <a class="${active==='g1'?'active':''}" href="#"><span class="ic">🍕</span> Goa Trip</a>
      <a class="${active==='g2'?'active':''}" href="#"><span class="ic">🏠</span> Flatmates</a>
      <a class="${active==='g3'?'active':''}" href="#"><span class="ic">🎉</span> Birthday Bash</a>
    </nav>
    <div class="side-foot"><span class="avatar avatar-sm" style="background:var(--purple)">A</span><div><div style="font-weight:600;font-size:14px">Aarav</div><div style="font-size:12px;color:var(--muted)">Free plan</div></div></div>
  </aside>
  <main class="main">
    <div class="topbar">${topbar}</div>
    ${main}
  </main>
</div>`;
}

/* ============================================================
   SCREEN CONTENT (web)
   ============================================================ */
const SCREENS = [];

/* ---- 1. LANDING (new, researched layout) ---- */
SCREENS.push({ n:1, slug:'landing', title:'Landing', label:'Landing / Marketing', html:`
${NAV}
<header class="hero"><div class="wrap">
  <div class="hero-grid">
    <div>
      <div class="chip chip-p" style="margin-bottom:18px">✨ Now with AI voice & receipt scan</div>
      <h1 class="h-hero">Split bills without the awkward maths.</h1>
      <p class="lead" style="margin:22px 0 30px;text-align:left">Track shared expenses, split costs fairly, and settle up in seconds — with voice, photos, and smart analytics.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <a class="btn btn-dark btn-lg" href="#">Get started — it's free</a>
        <a class="btn btn-outline btn-lg" href="#">▶ Watch demo</a>
      </div>
      <div style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">
        <span class="pill-stat">⭐ 4.9 App Store</span>
        <span class="pill-stat">🔒 Bank-grade security</span>
        <span class="pill-stat">🌍 30+ currencies</span>
      </div>
    </div>
    <div class="hero-visual">
      <div class="hero-blob blob1"></div><div class="hero-blob blob2"></div>
      <div class="float-card fcy"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">Trip to Goa</div><div style="font-weight:700;font-size:22px">₹4,820 owed</div><div style="margin-top:12px;height:8px;background:var(--line);border-radius:10px"><div style="width:62%;height:100%;background:var(--dark);border-radius:10px"></div></div></div>
      <div class="float-card fcp"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">🎤 "Dinner ₹1,200, split 4 ways"</div><div style="font-weight:700;font-size:18px">Added in 2s</div></div>
      <div class="float-card fct"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">Settled up</div><div style="font-weight:700;font-size:20px">You're all square ✅</div></div>
    </div>
  </div>
</div></header>

<div class="wrap"><div class="logos"><span>Notion</span><span>Stripe</span><span>Airbnb</span><span>Linear</span><span>Spotify</span></div></div>

<section class="section"><div class="wrap center">
  <div class="eyebrow">Why split4me</div>
  <h2 class="h-sec">Everything you need to split fairly</h2>
  <p class="lead" style="margin-top:14px">From a quick coffee to a month-long trip, split4me keeps every rupee accounted for.</p>
</div>
<div class="wrap" style="margin-top:50px"><div class="grid-3">
  <div class="feature"><div class="ficon" style="background:var(--purple-l)">🎤</div><h3>AI Voice Expenses</h3><p>Just say it — "Taxi ₹350, split between 3" — and it's logged instantly.</p></div>
  <div class="feature"><div class="ficon" style="background:var(--yellow)">📷</div><h3>Receipt Scan (OCR)</h3><p>Snap a bill, we read the items and draft the split for you to confirm.</p></div>
  <div class="feature"><div class="ficon" style="background:var(--teal)">⚖️</div><h3>Smart Splits</h3><p>Evenly, by shares, by percentage, or exact amounts — your call.</p></div>
  <div class="feature"><div class="ficon" style="background:var(--teal)">📒</div><h3>Shared Ledger</h3><p>One transparent record everyone in the group can see and trust.</p></div>
  <div class="feature"><div class="ficon" style="background:var(--purple-l)">📊</div><h3>Analytics</h3><p>See who owes what and where your money goes, month by month.</p></div>
  <div class="feature"><div class="ficon" style="background:var(--yellow)">🌍</div><h3>Multi-currency</h3><p>Trips abroad? Track in 30+ currencies with live conversion.</p></div>
</div></div></section>

<section class="section" style="background:#fff"><div class="wrap center">
  <div class="eyebrow">How it works</div>
  <h2 class="h-sec">Three steps to fair splits</h2>
</div>
<div class="wrap" style="margin-top:46px"><div class="steps">
  <div class="step"><div class="n" style="background:var(--purple)">1</div><h3>Create a group</h3><p>Add friends, flatmates or trip-mates. No one needs to install anything to view.</p></div>
  <div class="step"><div class="n" style="background:var(--yellow)">2</div><h3>Add expenses</h3><p>Log spend by voice, photo, or tap — and pick how to split it.</p></div>
  <div class="step"><div class="n" style="background:var(--teal)">3</div><h3>Settle up</h3><p>See balances at a glance and pay back with one tap.</p></div>
</div></div></section>

<section class="section"><div class="wrap"><div class="grid-3">
  <div class="quote"><p>"Settling our Goa trip used to take a week of spreadsheets. split4me did it in minutes."</p><div class="who"><span class="avatar" style="background:var(--purple)">M</span><div><b>Meera</b><br><span style="color:var(--muted);font-size:13px">Trip planner</span></div></div></div>
  <div class="quote"><p>"The voice feature is wild — I log expenses while cooking dinner."</p><div class="who"><span class="avatar" style="background:var(--yellow)">R</span><div><b>Rohan</b><br><span style="color:var(--muted);font-size:13px">Flatmate</span></div></div></div>
  <div class="quote"><p>"Finally an app that makes splitting fair and actually fun."</p><div class="who"><span class="avatar" style="background:var(--teal)">A</span><div><b>Aisha</b><br><span style="color:var(--muted);font-size:13px">Freelancer</span></div></div></div>
</div></div></section>

<section class="section"><div class="wrap"><div class="cta-band">
  <div class="hero-blob" style="width:200px;height:200px;background:var(--purple);top:-40px;right:10%;opacity:.4"></div>
  <h2>Stop doing the maths. Start splitting.</h2>
  <p>Join thousands who've made "who owes who" a thing of the past.</p>
  <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
    <a class="btn btn-yellow btn-lg" href="#">Get started free</a>
    <a class="btn btn-outline btn-lg" style="color:#fff;border-color:rgba(255,255,255,0.4)" href="#">Talk to us</a>
  </div>
</div></div></section>
${FOOTER}
`});

/* ---- 2. Onboarding: Voice (feature page) ---- */
SCREENS.push({ n:2, slug:'onboard-voice', title:'Onboarding — AI Voice', label:'Onboarding — AI Voice Expense Tracking', html:`
${NAV}
<section class="section"><div class="wrap">
  <div class="hero-grid">
    <div>
      <div class="chip chip-p" style="margin-bottom:18px">Feature spotlight</div>
      <h2 class="h-sec">Log expenses by voice in two seconds.</h2>
      <p class="lead" style="text-align:left;margin:20px 0 26px">No typing, no forms. Just speak naturally and split4me understands the amount, who paid, and how to split it.</p>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:14px;margin-bottom:28px">
        <li style="display:flex;gap:12px"><span style="width:28px;height:28px;border-radius:50%;background:var(--purple);display:flex;align-items:center;justify-content:center">✓</span><div><b>Hands-free logging</b><br><span style="color:var(--muted);font-size:14px">Perfect while commuting or cooking.</span></div></li>
        <li style="display:flex;gap:12px"><span style="width:28px;height:28px;border-radius:50%;background:var(--purple);display:flex;align-items:center;justify-content:center">✓</span><div><b>Smart parsing</b><br><span style="color:var(--muted);font-size:14px">"Coffee ₹180 for me and Sam" → done.</span></div></li>
      </ul>
      <a class="btn btn-dark btn-lg" href="#">Try it now</a>
    </div>
    <div style="background:#fff;border-radius:var(--r-lg);box-shadow:var(--shadow);padding:34px;text-align:center">
      <div style="width:90px;height:90px;border-radius:50%;background:var(--purple-l);display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 20px;animation:pulse 2s infinite">🎤</div>
      <div style="font-weight:600;margin-bottom:6px">Listening…</div>
      <div style="color:var(--muted);font-size:14px;margin-bottom:20px">"Dinner ₹1,200, split 4 ways"</div>
      <div style="background:var(--bg);border-radius:18px;padding:18px;text-align:left;font-size:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Dinner</span><b>₹1,200</b></div>
        <div style="display:flex;justify-content:space-between;color:var(--muted)"><span>Split 4 ways</span><span>₹300 each</span></div>
      </div>
    </div>
  </div>
</div></section>
<style>@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}</style>
${FOOTER}
`});

/* ---- 3. Onboarding: Shared Ledger ---- */
SCREENS.push({ n:3, slug:'onboard-ledger', title:'Onboarding — Shared Ledger', label:'Onboarding — Shared Ledger', html:`
${NAV}
<section class="section"><div class="wrap">
  <div class="hero-grid">
    <div style="order:2">
      <div class="chip chip-t" style="margin-bottom:18px">Feature spotlight</div>
      <h2 class="h-sec">One ledger everyone can trust.</h2>
      <p class="lead" style="text-align:left;margin:20px 0 26px">Every expense, payment and adjustment in a single transparent timeline — no "did you log that?" ever again.</p>
      <a class="btn btn-dark btn-lg" href="#">Create a ledger</a>
    </div>
    <div class="list" style="order:1">
      <div class="row"><span class="avatar" style="background:var(--yellow)">S</span><div class="grow"><div class="t">Sam paid · Groceries</div><div class="s">Today · Flatmates</div></div><div class="amt">+₹640</div></div>
      <div class="row"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Meera paid · Electricity</div><div class="s">Yesterday</div></div><div class="amt">+₹1,200</div></div>
      <div class="row"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">Aarav settled up</div><div class="s">2 days ago</div></div><div class="amt" style="color:#16A34A">✓</div></div>
    </div>
  </div>
</div></section>
${FOOTER}
`});

/* ---- 4. Onboarding: Smart Split & Analytics ---- */
SCREENS.push({ n:4, slug:'onboard-split', title:'Onboarding — Smart Split', label:'Onboarding — Smart Split & Analytics', html:`
${NAV}
<section class="section"><div class="wrap">
  <div class="hero-grid">
    <div>
      <div class="chip chip-y" style="margin-bottom:18px">Feature spotlight</div>
      <h2 class="h-sec">Split any way you like.</h2>
      <p class="lead" style="text-align:left;margin:20px 0 26px">Evenly, by shares, by percentage, or exact amounts — plus beautiful analytics so you always know where money goes.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">
        <span class="chip chip-p">⚖️ Evenly</span><span class="chip chip-y">🔢 Shares</span><span class="chip chip-t">% Percentage</span><span class="chip chip-soft">₹ Exact</span>
      </div>
      <a class="btn btn-dark btn-lg" href="#">See analytics</a>
    </div>
    <div class="card"><div class="lbl" style="color:var(--muted);font-size:13px;margin-bottom:16px">This month · Goa Trip</div>
      <div class="bars">
        <div class="bar y" style="height:60%"><span class="bl">Food</span></div>
        <div class="bar" style="height:90%"><span class="bl">Stay</span></div>
        <div class="bar t" style="height:45%"><span class="bl">Travel</span></div>
        <div class="bar" style="height:70%"><span class="bl">Fun</span></div>
        <div class="bar y" style="height:35%"><span class="bl">Misc</span></div>
      </div>
      <div class="legend"><span><i style="background:var(--purple)"></i>You</span><span><i style="background:var(--yellow)"></i>Sam</span><span><i style="background:var(--teal)"></i>Meera</span></div>
    </div>
  </div>
</div></section>
${FOOTER}
`});

/* ---- 5. Sign In ---- */
SCREENS.push({ n:5, slug:'signin', title:'Sign In', label:'Sign In', html:`
${NAV}
<section class="section"><div class="wrap" style="display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center;min-height:70vh">
  <div style="padding-right:60px">
    <div class="chip chip-p" style="margin-bottom:18px">Welcome back 👋</div>
    <h2 class="h-sec">Sign in to split4me</h2>
    <p class="lead" style="text-align:left;margin:16px 0 30px">Pick up right where you left off — your groups and balances are waiting.</p>
    <div style="display:flex;flex-direction:column;gap:12px;max-width:340px">
      <button class="btn btn-outline btn-lg" style="justify-content:flex-start;gap:12px">🔍 Continue with Google</button>
      <button class="btn btn-outline btn-lg" style="justify-content:flex-start;gap:12px">🍎 Continue with Apple</button>
    </div>
  </div>
  <div class="form-card" style="margin:0 auto">
    <h3 style="font-size:20px;font-weight:600;margin-bottom:22px">Sign in</h3>
    <div class="field"><label>Email</label><input placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input type="password" placeholder="••••••••"></div>
    <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:6px">Sign in</button>
    <p style="text-align:center;font-size:14px;color:var(--muted);margin-top:18px">New here? <a href="#" style="color:var(--text);font-weight:600">Create an account</a></p>
  </div>
</div></section>
`});

/* ---- 6. Sign Up ---- */
SCREENS.push({ n:6, slug:'signup', title:'Sign Up', label:'Sign Up', html:`
${NAV}
<section class="section"><div class="wrap" style="display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center;min-height:70vh">
  <div class="form-card" style="margin:0 auto;order:2">
    <h3 style="font-size:20px;font-weight:600;margin-bottom:22px">Create your account</h3>
    <div class="field"><label>Name</label><input placeholder="Your name"></div>
    <div class="field"><label>Email</label><input placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input type="password" placeholder="Create a password"></div>
    <button class="btn btn-dark" style="width:100%;justify-content:center">Get started free</button>
    <div style="display:flex;gap:10px;margin-top:14px">
      <button class="btn btn-outline" style="flex:1;justify-content:center">🔍 Google</button>
      <button class="btn btn-outline" style="flex:1;justify-content:center">🍎 Apple</button>
    </div>
  </div>
  <div style="padding-left:60px;order:1">
    <div class="chip chip-y" style="margin-bottom:18px">Free forever plan</div>
    <h2 class="h-sec">Join in 30 seconds.</h2>
    <ul style="list-style:none;display:flex;flex-direction:column;gap:16px;margin-top:24px">
      <li style="display:flex;gap:12px"><span style="width:30px;height:30px;border-radius:50%;background:var(--yellow);display:flex;align-items:center;justify-content:center">✓</span><div><b>Unlimited groups</b><br><span style="color:var(--muted);font-size:14px">No caps, no credit card.</span></div></li>
      <li style="display:flex;gap:12px"><span style="width:30px;height:30px;border-radius:50%;background:var(--purple);display:flex;align-items:center;justify-content:center">✓</span><div><b>Voice & receipt scan</b><br><span style="color:var(--muted);font-size:14px">Log expenses instantly.</span></div></li>
      <li style="display:flex;gap:12px"><span style="width:30px;height:30px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center">✓</span><div><b>Cross-device sync</b><br><span style="color:var(--muted);font-size:14px">Web, iOS and Android.</span></div></li>
    </ul>
  </div>
</div></section>
`});

/* ---- 7. Dashboard ---- */
SCREENS.push({ n:7, slug:'dashboard', title:'Groups Dashboard', label:'Groups Dashboard', html:`
${appShell('dash',
  `<div><div class="eyebrow" style="margin-bottom:4px">Welcome back, Aarav</div><h1>Your groups</h1></div>
   <div class="actions"><div class="search">🔍 Search groups</div><button class="btn btn-dark">＋ New group</button></div>`,
  `<div class="sum-grid">
     <div class="sum"><div class="lbl">You are owed</div><div class="val" style="color:#16A34A">₹2,480</div><div class="sub">across 3 groups</div></div>
     <div class="sum"><div class="lbl">You owe</div><div class="val">₹960</div><div class="sub">settle up soon</div></div>
     <div class="sum"><div class="lbl">This month</div><div class="val">₹9,140</div><div class="sub">12 expenses logged</div></div>
   </div>
   <div class="group-grid">
     <div class="gcard"><div class="top" style="background:var(--purple)"><span class="avatar avatar-lg" style="background:#fff">🍕</span></div><div class="body"><h3>Goa Trip</h3><div class="meta"><span>5 members</span><span style="color:#16A34A;font-weight:600">+₹2,480</span></div></div></div>
     <div class="gcard"><div class="top" style="background:var(--yellow)"><span class="avatar avatar-lg" style="background:#fff">🏠</span></div><div class="body"><h3>Flatmates</h3><div class="meta"><span>3 members</span><span style="color:#DC2626;font-weight:600">−₹960</span></div></div></div>
     <div class="gcard"><div class="top" style="background:var(--teal)"><span class="avatar avatar-lg" style="background:#fff">🎉</span></div><div class="body"><h3>Birthday Bash</h3><div class="meta"><span>8 members</span><span style="color:var(--muted)">all square</span></div></div></div>
   </div>`
)}`});

/* ---- 8. Split Detail ---- */
SCREENS.push({ n:8, slug:'split-detail', title:'Split Bill Detail', label:'Split Bill Detail', html:`
${appShell('g1',
  `<div style="display:flex;align-items:center;gap:12px"><span class="group-chip"><span class="avatar avatar-sm" style="background:var(--purple)">🍕</span> Goa Trip</span></div>
   <div class="actions"><button class="btn btn-outline btn-sm">⚙ Settings</button><button class="btn btn-dark">＋ Add expense</button></div>`,
  `<div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:24px">
     <div class="sum" style="flex:1;min-width:200px"><div class="lbl">Total spent</div><div class="val">₹24,600</div></div>
     <div class="sum" style="flex:1;min-width:200px"><div class="lbl">Your balance</div><div class="val" style="color:#16A34A">+₹2,480</div></div>
     <div class="sum" style="flex:1;min-width:200px"><div class="lbl">Members</div><div class="val">5</div></div>
   </div>
   <div class="tabs"><a class="active" href="#">Overview</a><a href="#">Expenses</a><a href="#">Balances</a><a href="#">Stats</a></div>
   <div class="list">
     <div class="row"><span class="avatar" style="background:var(--yellow)">S</span><div class="grow"><div class="t">Sam paid · Resort</div><div class="s">₹12,000 · 3 days ago</div></div><div class="amt">₹2,400</div></div>
     <div class="row"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Meera paid · Scuba</div><div class="s">₹6,000 · 4 days ago</div></div><div class="amt">₹1,200</div></div>
     <div class="row"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">You paid · Dinner</div><div class="s">₹4,800 · yesterday</div></div><div class="amt">₹960</div></div>
   </div>`
)}`});

/* ---- 9. Expenses ---- */
SCREENS.push({ n:9, slug:'expenses', title:'Expenses List', label:'Expenses List', html:`
${appShell('exp',
  `<div><h1>Expenses</h1></div>
   <div class="actions"><div class="search">🔍 Search</div><button class="btn btn-dark">＋ Add</button></div>`,
  `<div class="tabs"><a class="active" href="#">All</a><a href="#">Mine</a><a href="#">This month</a><a href="#">By category</a></div>
   <div class="list">
     <div class="row"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">Dinner at Fisherman's</div><div class="s">You paid · Goa Trip · Yesterday</div></div><div class="amt">₹4,800</div></div>
     <div class="row"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Scuba diving</div><div class="s">Meera paid · Goa Trip · 4 days ago</div></div><div class="amt">₹6,000</div></div>
     <div class="row"><span class="avatar" style="background:var(--yellow)">S</span><div class="grow"><div class="t">Resort booking</div><div class="s">Sam paid · Goa Trip · 3 days ago</div></div><div class="amt">₹12,000</div></div>
     <div class="row"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">Taxi from airport</div><div class="s">You paid · Goa Trip · 6 days ago</div></div><div class="amt">₹1,200</div></div>
     <div class="row"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Groceries</div><div class="s">Meera paid · Flatmates · Today</div></div><div class="amt">₹640</div></div>
   </div>`
)}`});

/* ---- 10. Create Expense ---- */
SCREENS.push({ n:10, slug:'create-expense', title:'Create Expense', label:'Create Expense', html:`
${appShell('exp',
  `<div><h1>Add expense</h1></div><div class="actions"><button class="btn btn-ghost btn-sm">Cancel</button><button class="btn btn-dark btn-sm">Save</button></div>`,
  `<div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:24px">
    <div class="form-card" style="max-width:none">
      <div class="field"><label>Description</label><input placeholder="e.g. Dinner"></div>
      <div class="two-col"><div class="field"><label>Amount</label><input placeholder="₹0.00"></div><div class="field"><label>Currency</label><select><option>INR ₹</option><option>USD $</option><option>EUR €</option></select></div></div>
      <div class="field"><label>Paid by</label><select><option>You</option><option>Sam</option><option>Meera</option></select></div>
      <div class="field"><label>Split with</label><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-p">Sam ✓</span><span class="chip chip-y">Meera ✓</span><span class="chip chip-t">Aarav ✓</span><span class="chip chip-soft">+ Add</span></div></div>
    </div>
    <div class="card"><div class="lbl" style="color:var(--muted);font-size:13px;margin-bottom:14px">Split preview</div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span>Sam</span><b>₹1,600</b></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span>Meera</span><b>₹1,600</b></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0"><span>Aarav</span><b>₹1,600</b></div>
    </div>
  </div>`
)}`});

/* ---- 11. Balances ---- */
SCREENS.push({ n:11, slug:'balances', title:'Balances', label:'Balances & Reimbursements', html:`
${appShell('bal',
  `<div><h1>Balances</h1></div><div class="actions"><button class="btn btn-dark">Settle up</button></div>`,
  `<div class="sum-grid">
     <div class="sum"><div class="lbl">Net balance</div><div class="val" style="color:#16A34A">+₹1,520</div></div>
     <div class="sum"><div class="lbl">To receive</div><div class="val">₹2,480</div></div>
     <div class="sum"><div class="lbl">To pay</div><div class="val">₹960</div></div>
   </div>
   <div class="card" style="margin-bottom:20px"><div style="font-weight:600;margin-bottom:14px">Who owes whom</div>
     <div class="row" style="border:none;padding:12px 0"><div class="av-stack"><span class="avatar avatar-sm" style="background:var(--purple)">S</span><span class="avatar avatar-sm" style="background:var(--teal)">A</span></div><div class="grow" style="margin-left:12px"><div class="t">Sam owes you</div><div class="s">Goa Trip</div></div><div class="amt" style="color:#16A34A">₹2,480</div></div>
     <div class="row" style="border:none;padding:12px 0"><div class="av-stack"><span class="avatar avatar-sm" style="background:var(--teal)">A</span><span class="avatar avatar-sm" style="background:var(--yellow)">M</span></div><div class="grow" style="margin-left:12px"><div class="t">You owe Meera</div><div class="s">Flatmates</div></div><div class="amt" style="color:#DC2626">₹960</div></div>
   </div>
   <div class="tabs"><a class="active" href="#">Reimbursements</a><a href="#">History</a></div>
   <div class="list">
     <div class="row"><span class="avatar" style="background:var(--purple)">S</span><div class="grow"><div class="t">Sam → You</div><div class="s">Pending · Goa Trip</div></div><button class="btn btn-yellow btn-sm">Remind</button></div>
     <div class="row"><span class="avatar" style="background:var(--yellow)">M</span><div class="grow"><div class="t">You → Meera</div><div class="s">Settle now</div></div><button class="btn btn-dark btn-sm">Pay ₹960</button></div>
   </div>`
)}`});

/* ---- 12. Stats ---- */
SCREENS.push({ n:12, slug:'stats', title:'Statistics', label:'Statistics', html:`
${appShell('stat',
  `<div><h1>Statistics</h1></div><div class="actions"><div class="search">📅 This month</div></div>`,
  `<div class="sum-grid">
     <div class="sum"><div class="lbl">Total spent</div><div class="val">₹9,140</div></div>
     <div class="sum"><div class="lbl">Avg / expense</div><div class="val">₹762</div></div>
     <div class="sum"><div class="lbl">Top category</div><div class="val" style="font-size:24px">Food 🍽️</div></div>
   </div>
   <div class="grid-2">
     <div class="card"><div style="font-weight:600;margin-bottom:18px">Spend by category</div>
       <div class="bars">
         <div class="bar y" style="height:80%"><span class="bl">Food</span></div>
         <div class="bar" style="height:55%"><span class="bl">Stay</span></div>
         <div class="bar t" style="height:40%"><span class="bl">Travel</span></div>
         <div class="bar" style="height:65%"><span class="bl">Fun</span></div>
       </div>
       <div class="legend"><span><i style="background:var(--yellow)"></i>Food</span><span><i style="background:var(--purple)"></i>Stay</span><span><i style="background:var(--teal)"></i>Travel</span><span><i style="background:#1D1C22"></i>Fun</span></div>
     </div>
     <div class="card"><div style="font-weight:600;margin-bottom:18px">Per member</div>
       <div style="display:flex;flex-direction:column;gap:14px">
         <div><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>Sam</span><b>₹3,200</b></div><div style="height:10px;background:var(--line);border-radius:10px"><div style="width:70%;height:100%;background:var(--purple);border-radius:10px"></div></div></div>
         <div><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>Meera</span><b>₹2,900</b></div><div style="height:10px;background:var(--line);border-radius:10px"><div style="width:63%;height:100%;background:var(--yellow);border-radius:10px"></div></div></div>
         <div><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>You</span><b>₹3,040</b></div><div style="height:10px;background:var(--line);border-radius:10px"><div style="width:66%;height:100%;background:var(--teal);border-radius:10px"></div></div></div>
       </div>
     </div>
   </div>`
)}`});

/* ---- 13. Group Info ---- */
SCREENS.push({ n:13, slug:'group-info', title:'Group Information', label:'Group Information', html:`
${appShell('g1',
  `<div><h1>Group information</h1></div><div class="actions"><button class="btn btn-outline btn-sm">Share</button></div>`,
  `<div class="card-lg" style="margin-bottom:20px;display:flex;align-items:center;gap:20px">
     <span class="avatar avatar-lg" style="background:var(--purple);font-size:40px">🍕</span>
     <div><h2 style="font-size:24px;font-weight:700">Goa Trip</h2><div style="color:var(--muted)">Created 12 Aug 2025 · 5 members</div></div>
   </div>
   <div class="card"><div style="font-weight:600;margin-bottom:14px">Members</div>
     <div class="row" style="border:none;padding:10px 0"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">Aarav (you)</div><div class="s">+₹2,480</div></div><span class="chip chip-soft">Admin</span></div>
     <div class="row" style="border:none;padding:10px 0"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Meera</div><div class="s">−₹640</div></div></div>
     <div class="row" style="border:none;padding:10px 0"><span class="avatar" style="background:var(--yellow)">S</span><div class="grow"><div class="t">Sam</div><div class="s">−₹1,840</div></div></div>
   </div>`
)}`});

/* ---- 14. Activity ---- */
SCREENS.push({ n:14, slug:'activity', title:'Activity Log', label:'Activity Log', html:`
${appShell('act',
  `<div><h1>Activity</h1></div><div class="actions"><div class="search">🔍 Filter</div></div>`,
  `<div class="list">
     <div class="row"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">You added "Dinner"</div><div class="s">Goa Trip · 2h ago</div></div><div class="amt">₹4,800</div></div>
     <div class="row"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Meera settled up</div><div class="s">Flatmates · 5h ago</div></div><div class="amt" style="color:#16A34A">✓</div></div>
     <div class="row"><span class="avatar" style="background:var(--yellow)">S</span><div class="grow"><div class="t">Sam joined Goa Trip</div><div class="s">1 day ago</div></div></div>
     <div class="row"><span class="avatar" style="background:var(--teal)">A</span><div class="grow"><div class="t">You scanned a receipt</div><div class="s">Flatmates · 1 day ago</div></div><div class="amt">₹640</div></div>
     <div class="row"><span class="avatar" style="background:var(--purple)">M</span><div class="grow"><div class="t">Meera added "Scuba"</div><div class="s">Goa Trip · 2 days ago</div></div><div class="amt">₹6,000</div></div>
   </div>`
)}`});

/* ---- 15. OCR Receipt Preview ---- */
SCREENS.push({ n:15, slug:'ocr-preview', title:'OCR Receipt Preview', label:'OCR Receipt Preview', html:`
${appShell('exp',
  `<div><h1>Receipt scan</h1></div><div class="actions"><button class="btn btn-ghost btn-sm">Retake</button><button class="btn btn-dark btn-sm">Confirm</button></div>`,
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
    <div style="background:#fff;border-radius:var(--r);box-shadow:var(--shadow);padding:18px;text-align:center">
      <div style="background:var(--bg);border-radius:16px;padding:30px;font-size:14px;color:var(--muted)">🧾 Receipt image<br><span style="font-size:12px">Goa Cafe · ₹1,240</span></div>
      <div class="chip chip-t" style="margin-top:14px">✓ Extracted 4 items</div>
    </div>
    <div class="receipt">
      <div style="font-weight:700;margin-bottom:6px">Goa Cafe</div>
      <div style="color:var(--muted);font-size:13px;margin-bottom:14px">12 Aug 2025</div>
      <div class="rline"><span>Coffee ×2</span><span>₹240</span></div>
      <div class="rline"><span>Club sandwich</span><span>₹420</span></div>
      <div class="rline"><span>Orange juice ×2</span><span>₹320</span></div>
      <div class="rline"><span>Tip</span><span>₹260</span></div>
      <div class="rtot"><span>Total</span><span>₹1,240</span></div>
      <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:18px">Add as expense</button>
    </div>
  </div>`
)}`});

/* ---- 16. Split Now (sliders) ---- */
SCREENS.push({ n:16, slug:'split-now', title:'Split Now', label:'Split Now — Custom Amount Sliders', html:`
${appShell('exp',
  `<div><h1>Split ₹4,800</h1></div><div class="actions"><button class="btn btn-dark btn-sm">Done</button></div>`,
  `<div class="card" style="max-width:620px">
     <div class="slider-row"><span class="avatar avatar-sm" style="background:var(--teal)">A</span><div class="name">Aarav</div><input type="range" min="0" max="4800" value="1600"><div class="val">₹1,600</div></div>
     <div class="slider-row"><span class="avatar avatar-sm" style="background:var(--purple)">M</span><div class="name">Meera</div><input type="range" min="0" max="4800" value="1600"><div class="val">₹1,600</div></div>
     <div class="slider-row"><span class="avatar avatar-sm" style="background:var(--yellow)">S</span><div class="name">Sam</div><input type="range" min="0" max="4800" value="1600"><div class="val">₹1,600</div></div>
     <div style="display:flex;justify-content:space-between;margin-top:18px;padding-top:16px;border-top:1px solid var(--line);font-weight:700"><span>Total</span><span>₹4,800</span></div>
   </div>`
)}`});

/* ---- 17. Create Group ---- */
SCREENS.push({ n:17, slug:'create-group', title:'Create Group', label:'Create Group', html:`
${appShell('dash',
  `<div><h1>New group</h1></div><div class="actions"><button class="btn btn-ghost btn-sm">Cancel</button><button class="btn btn-dark btn-sm">Create</button></div>`,
  `<div class="form-card">
     <div class="field"><label>Group name</label><input placeholder="e.g. Goa Trip"></div>
     <div class="field"><label>Description</label><textarea rows="3" placeholder="What's this group for?"></textarea></div>
     <div class="field"><label>Currency</label><select><option>INR ₹</option><option>USD $</option><option>EUR €</option></select></div>
     <div class="field"><label>Invite members</label><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-p">Sam ✓</span><span class="chip chip-y">Meera ✓</span><span class="chip chip-soft">+ Invite</span></div></div>
   </div>`
)}`});

/* ---- 18. Split Modes ---- */
SCREENS.push({ n:18, slug:'split-modes', title:'Split Modes', label:'Split Modes — Evenly / Shares / % / Amount', html:`
${appShell('exp',
  `<div><h1>Choose split mode</h1></div><div class="actions"><button class="btn btn-dark btn-sm">Apply</button></div>`,
  `<div style="display:flex;flex-direction:column;gap:14px;max-width:560px">
     <div class="mode active"><span class="mi">⚖️</span><div><h4>Evenly</h4><p>Split the total into equal parts.</p></div></div>
     <div class="mode"><span class="mi">🔢</span><div><h4>By shares</h4><p>Assign weights, e.g. 2 shares vs 1.</p></div></div>
     <div class="mode"><span class="mi">%</span><div><h4>By percentage</h4><p>Distribute by custom percentages.</p></div></div>
     <div class="mode"><span class="mi">₹</span><div><h4>Exact amounts</h4><p>Type the precise amount per person.</p></div></div>
   </div>`
)}`});

/* ---- 19. Receipt Scan & AI Draft ---- */
SCREENS.push({ n:19, slug:'receipt-scan', title:'Receipt Scan & AI Draft', label:'Receipt Scan & AI Draft Review', html:`
${appShell('exp',
  `<div><h1>AI draft review</h1></div><div class="actions"><button class="btn btn-ghost btn-sm">Discard</button><button class="btn btn-dark btn-sm">Save expense</button></div>`,
  `<div class="card" style="max-width:620px">
     <div class="chip chip-t" style="margin-bottom:16px">🤖 AI drafted from receipt</div>
     <div class="field"><label>Description</label><input value="Goa Cafe dinner"></div>
     <div class="two-col"><div class="field"><label>Amount</label><input value="₹1,240"></div><div class="field"><label>Category</label><select><option>Food</option><option>Travel</option></select></div></div>
     <div class="field"><label>Split</label><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-p">Aarav ✓</span><span class="chip chip-y">Meera ✓</span><span class="chip chip-t">Sam ✓</span></div></div>
   </div>`
)}`});

/* ---- 20. Group Settings ---- */
SCREENS.push({ n:20, slug:'group-settings', title:'Group Settings', label:'Group Settings', html:`
${appShell('g1',
  `<div><h1>Group settings</h1></div><div class="actions"><button class="btn btn-dark btn-sm">Save</button></div>`,
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
     <div class="form-card" style="max-width:none"><h3 style="font-weight:600;margin-bottom:18px">General</h3>
       <div class="field"><label>Name</label><input value="Goa Trip"></div>
       <div class="field"><label>Default currency</label><select><option>INR ₹</option></select></div>
     </div>
     <div class="form-card" style="max-width:none"><h3 style="font-weight:600;margin-bottom:18px">Danger zone</h3>
       <p style="color:var(--muted);font-size:14px;margin-bottom:14px">Remove members or delete this group. This cannot be undone.</p>
       <button class="btn btn-outline" style="border-color:#DC2626;color:#DC2626">Delete group</button>
     </div>
   </div>`
)}`});

/* ---- 21. Empty States ---- */
SCREENS.push({ n:21, slug:'empty-states', title:'Empty States', label:'Empty States', html:`
${appShell('dash',
  `<div><h1>Empty states</h1></div>`,
  `<div class="group-grid">
     <div class="gcard"><div class="body" style="padding:0"><div class="empty" style="padding:50px 20px"><div class="ic">🍽️</div><h3>No expenses yet</h3><p>Add the first expense to get started.</p><button class="btn btn-dark btn-sm">＋ Add expense</button></div></div></div>
     <div class="gcard"><div class="body" style="padding:0"><div class="empty" style="padding:50px 20px"><div class="ic">👥</div><h3>No groups</h3><p>Create a group to split with friends.</p><button class="btn btn-dark btn-sm">＋ New group</button></div></div></div>
     <div class="gcard"><div class="body" style="padding:0"><div class="empty" style="padding:50px 20px"><div class="ic">📊</div><h3>Nothing to report</h3><p>Stats appear once you log spend.</p></div></div></div>
   </div>`
)}`});

/* ---- 22. Dark Mode ---- */
SCREENS.push({ n:22, slug:'dark-mode', title:'Dark Mode', label:'Dark Mode — Dashboard', html:`
${appShell('dash',
  `<div><div class="eyebrow" style="margin-bottom:4px">Welcome back, Aarav</div><h1>Your groups</h1></div>
   <div class="actions"><div class="search">🔍 Search groups</div><button class="btn btn-dark">＋ New group</button></div>`,
  `<div class="sum-grid">
     <div class="sum"><div class="lbl">You are owed</div><div class="val" style="color:#4ADE80">₹2,480</div><div class="sub">across 3 groups</div></div>
     <div class="sum"><div class="lbl">You owe</div><div class="val">₹960</div><div class="sub">settle up soon</div></div>
     <div class="sum"><div class="lbl">This month</div><div class="val">₹9,140</div><div class="sub">12 expenses logged</div></div>
   </div>
   <div class="group-grid">
     <div class="gcard"><div class="top" style="background:var(--purple)"><span class="avatar avatar-lg" style="background:#fff">🍕</span></div><div class="body"><h3>Goa Trip</h3><div class="meta"><span>5 members</span><span style="color:#4ADE80;font-weight:600">+₹2,480</span></div></div></div>
     <div class="gcard"><div class="top" style="background:var(--yellow)"><span class="avatar avatar-lg" style="background:#fff">🏠</span></div><div class="body"><h3>Flatmates</h3><div class="meta"><span>3 members</span><span style="color:#F87171;font-weight:600">−₹960</span></div></div></div>
     <div class="gcard"><div class="top" style="background:var(--teal)"><span class="avatar avatar-lg" style="background:#fff">🎉</span></div><div class="body"><h3>Birthday Bash</h3><div class="meta"><span>8 members</span><span style="color:var(--muted)">all square</span></div></div></div>
   </div>`, true)}
`});

/* ============================================================
   WRITE OUTPUT
   ============================================================ */
function buildPage(inner, title){
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>split4me · Web · ${title}</title>\n<style>\n${WEB_CSS}\n</style>\n</head>\n<body>\n${inner}\n</body>\n</html>\n`;
}

// Per-screen standalone files
let count = 0;
for (const s of SCREENS){
  const file = `s${String(s.n).padStart(2,'0')}-${s.slug}.html`;
  fs.writeFileSync(path.join(outDir, file), buildPage(s.html, s.title), 'utf8');
  console.log('Wrote', file);
  count++;
}

// All-in-one web preview
const sections = SCREENS.map(s =>
  `<section class="wsec" id="s${s.n}">\n<div class="wlabel">Screen ${s.n} <span>${s.label}</span></div>\n${s.html}\n</section>`
).join('\n');
const preview = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>split4me — Web UI Preview (All Screens)</title>\n<style>\n${WEB_CSS}\n</style>\n</head>\n<body class="prev-body">\n<nav class="prev-nav"><span class="lab">split4me · Web</span>${SCREENS.map(s=>`<a href="#s${s.n}">${s.n}. ${s.title}</a>`).join('<span class="sep">·</span>')}</nav>\n${sections}\n</body>\n</html>\n`;
fs.writeFileSync(path.join(root, 'ui-preview-web.html'), preview, 'utf8');
console.log('Wrote ui-preview-web.html');
console.log(`\nDone. ${count} web screen files + 1 preview written.`);
