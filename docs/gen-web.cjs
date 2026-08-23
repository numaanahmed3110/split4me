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
  /* LIGHT — 「生成り」 kinari: warm unbleached-paper canvas, sumi ink text */
  --bg:#F6F2E9;
  --card:#FFFFFF;      --surface:#FFFFFF;   --surface-2:#FFFFFF;
  --text:#211F1B;
  --muted:#665F53;     /* AA >= 4.5:1 on card, canvas & pastel chips */
  --faint:#98948A;     /* decorative only */
  --success:#1B7A47;   --danger:#DC2626;
  --yellow:#FDECAD;  --yellow-d:#E6D799;  --yellow-ink:#6F5A14;
  --purple:#D8CEFA;  --purple-l:#E8E2FC;  --purple-ink:#564787;
  --teal:#E0F4F5;    --teal-d:#CDE6E8;    --teal-ink:#23555B;
  --dark:#1D1C22;
  --line:rgba(33,31,27,0.09);
  --shadow:0 24px 60px rgba(33,31,27,0.08);
  --shadow-sm:0 8px 24px rgba(33,31,27,0.05);
  --r:28px; --r-lg:36px; --pill:100px;
  --maxw:1180px;
}

*{margin:0;padding:0;box-sizing:border-box;font-family:'Poppins',sans-serif;-webkit-font-smoothing:antialiased;}
:focus-visible{outline:2px solid var(--text);outline-offset:2px;border-radius:inherit;}
body{background:var(--bg);color:var(--text);line-height:1.5;}
a{text-decoration:none;color:inherit;}
button{font-family:inherit;border:none;cursor:pointer;outline:none;}
::placeholder{color:var(--muted);opacity:1;}

.wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px;}
.center{text-align:center;}

/* ---------- Top Nav ---------- */
.wnav{position:sticky;top:0;z-index:60;background:rgba(246,242,233,0.82);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);}
.wnav-in{max-width:var(--maxw);margin:0 auto;padding:16px 28px;display:flex;align-items:center;justify-content:space-between;gap:24px;}
.wlogo{font-weight:800;font-size:20px;display:flex;align-items:center;gap:10px;letter-spacing:-0.5px;}
.wlogo .mark{width:34px;height:34px;border-radius:11px;background:var(--yellow);display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:var(--shadow-sm);color:#211F1B;}
.wlinks{display:flex;gap:30px;font-size:14px;font-weight:500;color:var(--muted);}
.wlinks a:hover{color:var(--text);}
.wnav-cta{display:flex;gap:12px;align-items:center;}
.wtoggle{width:42px;height:42px;border-radius:50%;background:var(--surface);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:var(--shadow-sm);}

/* ---------- Buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--pill);font-weight:600;font-size:14px;padding:14px 26px;transition:.18s;white-space:nowrap;}
.btn:hover{transform:translateY(-1px);}
.btn-primary{background:var(--purple);color:var(--text);box-shadow:var(--shadow-sm);} .btn-primary:hover{background:#c9bdf6;}
.btn-dark{background:var(--dark);color:#fff;box-shadow:var(--shadow-sm);} .btn-dark:hover{background:#000;}
.btn-yellow{background:var(--yellow);color:var(--text);box-shadow:var(--shadow-sm);} .btn-yellow:hover{background:var(--yellow-d);}
.btn-teal{background:var(--teal);color:var(--text);box-shadow:var(--shadow-sm);}
.btn-outline{background:transparent;border:1.5px solid rgba(28,28,30,0.14);color:var(--text);} .btn-outline:hover{background:var(--surface);}
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

.avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;color:#211F1B;}
.avatar-sm{width:32px;height:32px;font-size:14px;} .avatar-lg{width:52px;height:52px;font-size:24px;}

/* ---------- Hero ---------- */
.hero{position:relative;padding:70px 0 90px;overflow:hidden;}
.hero-grid{display:grid;grid-template-columns:1.05fr 0.95fr;gap:40px;align-items:center;}
.hero-visual{position:relative;height:480px;}
.float-card{position:absolute;background:var(--surface);border-radius:24px;box-shadow:var(--shadow);padding:18px;}
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
.feature{padding:30px;border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow-sm);border:1px solid var(--line);transition:.2s;}
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
.step{position:relative;padding:32px 28px;border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow-sm);}
.step .n{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;margin-bottom:16px;}
.step h3{font-size:18px;font-weight:600;margin-bottom:8px;}
.step p{font-size:14px;color:var(--muted);}

/* ---------- Testimonials ---------- */
.quote{padding:30px;border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow-sm);}
.quote p{font-size:15px;margin-bottom:18px;}
.quote .who{display:flex;align-items:center;gap:12px;font-size:14px;}
.quote .who b{font-weight:600;}

/* ---------- CTA band ---------- */
.cta-band{background:var(--dark);color:#fff;border-radius:var(--r-lg);padding:64px 48px;text-align:center;position:relative;overflow:hidden;}
.cta-band h2{color:#fff;font-size:clamp(28px,4vw,42px);font-weight:700;letter-spacing:-1px;margin-bottom:14px;}
.cta-band p{color:rgba(255,255,255,0.7);max-width:560px;margin:0 auto 28px;font-size:16px;}

/* ---------- Footer ---------- */
.foot{background:var(--surface);border-top:1px solid var(--line);padding:56px 0 30px;}
.foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:30px;margin-bottom:40px;}
.foot h4{font-size:14px;font-weight:600;margin-bottom:14px;}
.foot a{display:block;font-size:14px;color:var(--muted);margin-bottom:10px;}
.foot a:hover{color:var(--text);}
.foot-bottom{border-top:1px solid var(--line);padding-top:20px;display:flex;justify-content:space-between;font-size:13px;color:var(--muted);flex-wrap:wrap;gap:10px;}

/* ============================================================
   WEB APP SHELL (dashboard / screens 7-22)
   ============================================================ */
.app{display:grid;grid-template-columns:248px 1fr;min-height:100vh;background:var(--bg);color:var(--text);}
.sidebar{background:var(--surface);border-right:1px solid var(--line);padding:24px 18px;display:flex;flex-direction:column;gap:6px;position:sticky;top:0;height:100vh;}
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
.search{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--pill);padding:11px 18px;font-size:14px;color:var(--muted);min-width:240px;box-shadow:var(--shadow-sm);}
.group-chip{display:inline-flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--line);border-radius:var(--pill);padding:8px 16px 8px 8px;font-weight:600;font-size:14px;box-shadow:var(--shadow-sm);}

/* summary cards */
.sum-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:26px;}
.sum{background:var(--surface);border-radius:var(--r);box-shadow:var(--shadow-sm);padding:24px;border:1px solid var(--line);}
.sum .lbl{font-size:13px;color:var(--muted);margin-bottom:8px;}
.sum .val{font-size:34px;font-weight:800;letter-spacing:-1px;}
.sum .sub{font-size:13px;color:var(--muted);margin-top:6px;}

/* group cards */
.group-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.gcard{background:var(--surface);border-radius:var(--r);box-shadow:var(--shadow-sm);overflow:hidden;border:1px solid var(--line);transition:.2s;cursor:pointer;}
.gcard:hover{transform:translateY(-4px);box-shadow:var(--shadow);}
.gcard .top{height:96px;display:flex;align-items:flex-end;padding:18px;}
.gcard .body{padding:18px;}
.gcard h3{font-size:17px;font-weight:600;margin-bottom:4px;}
.gcard .meta{font-size:13px;color:var(--muted);display:flex;justify-content:space-between;}

/* lists / rows */
.list{background:var(--surface);border-radius:var(--r);box-shadow:var(--shadow-sm);border:1px solid var(--line);overflow:hidden;}
.row{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--line);}
.row:last-child{border-bottom:none;}
.row .grow{flex:1;}
.row .t{font-weight:600;font-size:15px;}
.row .s{font-size:13px;color:var(--muted);}
.row .amt{font-weight:700;font-size:15px;}

/* tabs */
.tabs{display:inline-flex;background:var(--surface);border:1px solid var(--line);border-radius:var(--pill);padding:5px;gap:4px;box-shadow:var(--shadow-sm);margin-bottom:24px;}
.tabs a{padding:10px 20px;border-radius:var(--pill);font-size:14px;font-weight:500;color:var(--muted);}
.tabs a.active{background:var(--purple);color:var(--text);font-weight:600;}

/* forms */
.form-card{background:var(--surface);border-radius:var(--r);box-shadow:var(--shadow);padding:34px;max-width:560px;}
.field{margin-bottom:20px;}
.field label{display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:var(--text);}
.field input,.field select,.field textarea{width:100%;border:1px solid var(--line);border-radius:16px;padding:14px 16px;font-size:14px;font-family:inherit;background:var(--surface);color:var(--text);}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--purple);box-shadow:0 0 0 4px rgba(216,206,250,0.4);}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}

/* balances / avatars stack */
.av-stack{display:flex;}
.av-stack .avatar{border:3px solid var(--card);margin-left:-12px;}
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
.slider-row input[type=range]{flex:1;accent-color:var(--text);}
.slider-row .val{width:80px;text-align:right;font-weight:700;}

/* receipt */
.receipt{background:var(--surface);border-radius:var(--r);box-shadow:var(--shadow);padding:28px;max-width:420px;}
.receipt .rline{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed var(--line);font-size:15px;}
.receipt .rtot{display:flex;justify-content:space-between;padding-top:16px;font-weight:800;font-size:20px;}

/* mode cards */
.mode{display:flex;align-items:center;gap:16px;padding:20px;border:2px solid var(--line);border-radius:20px;cursor:pointer;transition:.15s;background:var(--surface);}
.mode.active{border-color:var(--purple);background:var(--purple-l);}
.mode .mi{width:46px;height:46px;border-radius:14px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:22px;}
.mode h4{font-size:16px;font-weight:600;} .mode p{font-size:13px;color:var(--muted);}

/* empty state */
.empty{text-align:center;padding:70px 20px;}
.empty .ic{width:88px;height:88px;border-radius:28px;background:var(--purple-l);display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 22px;}
.empty h3{font-size:22px;font-weight:600;margin-bottom:8px;}
.empty p{color:var(--muted);margin-bottom:22px;}

/* ---------- Polish layer v2 ---------- */
.topbar{border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:26px;}
.topbar h1{letter-spacing:-0.6px;}
.sum{position:relative;overflow:hidden;}
.sum::after{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--purple-l);}
.sum:first-child::after{background:var(--yellow);}
.card,.list,.receipt{transition:transform .22s ease,box-shadow .22s ease;}
.list .row{transition:background .16s ease;border-radius:0;}
.list .row:hover{background:rgba(246,242,233,.55);}
.list .row:hover .t{color:var(--purple-ink);}
.gcard{cursor:pointer;}
.gcard:hover{transform:translateY(-5px);box-shadow:0 32px 70px rgba(33,31,27,.13);}
.gcard:hover b:first-child{color:var(--purple-ink);}
.tabs a:hover{color:var(--text);background:var(--bg);}
.btn-primary,.btn-dark,.btn-yellow{box-shadow:0 10px 24px rgba(33,31,27,.14);}
.form-card{box-shadow:var(--shadow);border:1px solid var(--line);}
.field label{text-transform:uppercase;font-size:11px;letter-spacing:1.2px;color:var(--muted);}
.empty .ic{box-shadow:0 20px 44px rgba(33,31,27,.12);}
.auth-grid{display:grid;grid-template-columns:1.05fr 1fr;border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow);min-height:640px;max-width:1080px;margin:56px auto;}
.auth-side{background:var(--dark);color:#F1EFE8;padding:52px 46px;display:flex;flex-direction:column;position:relative;overflow:hidden;}
.auth-side .blob{position:absolute;border-radius:50%;filter:blur(64px);opacity:.5;}
.auth-side blockquote{font-size:15px;line-height:1.65;color:#D8D4CC;border-left:3px solid var(--yellow);padding-left:16px;position:relative;}
.auth-side .who{margin-top:14px;font-size:13px;color:#9B97A3;position:relative;}
.auth-form{background:var(--card);display:flex;flex-direction:column;justify-content:center;padding:52px 54px;position:relative;}
.page-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:26px;align-items:start;}
.side-card{position:sticky;top:26px;}
.hero-band{background:linear-gradient(120deg,var(--yellow),var(--purple-l) 55%,var(--teal));border-radius:var(--r);padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:26px;box-shadow:var(--shadow-sm);}

/* ---------- Alignment normalisation v3 ---------- */
.main{margin:0 auto;padding-left:clamp(24px,4vw,52px);padding-right:clamp(24px,4vw,52px);}
.topbar{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;}
.topbar h1{font-size:24px !important;}
.form-card{max-width:720px;width:100%;}
.form-card .field{margin-bottom:18px;}
.list{width:100%;}
.receipt{width:100%;max-width:520px;}
h2{letter-spacing:-0.3px;}
.two-col,.sum-grid,.group-grid{width:100%;}
.empty{max-width:560px;margin:0 auto;}
.tabs{margin-left:0;}
.hero-band,.card,.list,.sum{border:1px solid var(--line);}

/* ---------- Dark app theme (screen 19) — 「夜」 yoru: sumi-violet night ---------- */
.dark-app{--bg:#141319;--card:#201F27;--surface:#201F27;--surface-2:#2A2833;--text:#F1EFE8;--muted:#A6A2AE;--faint:#7B7784;--success:#5FD68F;--danger:#E5766C;--line:rgba(255,255,255,0.09);--shadow:0 24px 60px rgba(0,0,0,0.45);--shadow-sm:0 8px 24px rgba(0,0,0,0.35);background:var(--bg);color:var(--text);}
.dark-app .wnav{background:rgba(20,19,25,0.82);border-color:var(--line);}
.dark-app .sidebar{background:#191820;border-color:var(--line);}
.dark-app .snav a:hover,.dark-app .snav a.active{background:#2A2833;color:#fff;}
.dark-app .side-foot{background:#2A2833;}
.dark-app .field input,.dark-app .field select,.dark-app .field textarea{background:#2A2833;border-color:var(--line);color:var(--text);}
.dark-app ::placeholder{color:var(--muted);opacity:1;}

/* ---------- Preview page chrome ---------- */
.prev-body{background:#15141A;padding:40px 20px;}
.prev-nav{position:sticky;top:0;z-index:100;background:rgba(21,20,26,0.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 28px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.prev-nav a{color:rgba(255,255,255,0.62);font-size:12px;font-weight:500;padding:7px 14px;border-radius:100px;transition:.2s;}
.prev-nav a:hover{color:#fff;background:rgba(255,255,255,0.08);}
.prev-nav .lab{color:rgba(255,255,255,0.55);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-right:8px;}
.prev-nav .sep{color:rgba(255,255,255,0.55);}
.wsec{margin-bottom:70px;scroll-margin-top:80px;}
.scr{background:var(--bg);border-radius:26px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow-sm);}
.wlabel{color:rgba(255,255,255,0.55);font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-align:center;margin-bottom:22px;}
.wlabel span{color:rgba(255,255,255,0.75);font-size:14px;letter-spacing:0;text-transform:none;display:block;margin-top:4px;}

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
      <a class="${active==='g1'?'active':''}" href="#"><span class="ic">🏖️</span> Bali Trip 2025</a>
      <a class="${active==='g2'?'active':''}" href="#"><span class="ic">🏠</span> Roommates</a>
      <a class="${active==='g3'?'active':''}" href="#"><span class="ic">🎉</span> Birthday Party</a>
    </nav>
    <div class="side-foot"><span class="avatar avatar-sm" style="background:var(--purple)">M</span><div><div style="font-weight:600;font-size:14px">Mank Kasep</div><div style="font-size:12px;color:var(--muted)">Free plan</div></div></div>
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
      <div class="float-card fcy"><div style="font-size:12px;color:var(--yellow-ink);margin-bottom:6px">Trip to Goa</div><div style="font-weight:700;font-size:22px">₹4,820 owed</div><div style="margin-top:12px;height:8px;background:var(--line);border-radius:10px"><div style="width:62%;height:100%;background:var(--dark);border-radius:10px"></div></div></div>
      <div class="float-card fcp"><div style="font-size:12px;color:var(--purple-ink);margin-bottom:6px">🎤 "Dinner ₹1,200, split 4 ways"</div><div style="font-weight:700;font-size:18px">Added in 2s</div></div>
      <div class="float-card fct"><div style="font-size:12px;color:var(--teal-ink);margin-bottom:6px">Settled up</div><div style="font-weight:700;font-size:20px">You're all square ✅</div></div>
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

<section class="section" style="background:var(--card)"><div class="wrap center">
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
SCREENS.push({ n:2, slug:'signin', title:'Sign In', label:'Sign In', html:`
<div class="wrap" style="padding-top:48px;padding-bottom:90px">
 <div class="auth-grid">
  <div class="auth-side">
   <div class="blob" style="width:300px;height:300px;background:var(--purple);top:-80px;right:-80px"></div>
   <div class="blob" style="width:240px;height:240px;background:var(--teal);bottom:-60px;left:-60px"></div>
   <a class="wlogo" href="#" style="color:#F1EFE8;position:relative"><span class="mark">💸</span> split4me</a>
   <h2 style="font-size:34px;font-weight:800;line-height:1.15;margin:auto 0 20px;position:relative;padding-top:36px">Split bills with<br>zero awkwardness.</h2>
   <blockquote>"Settling our Bali trip used to take spreadsheets. Now it takes seconds."</blockquote>
   <div class="who">— 4 friends, 12 expenses, one tap</div>
  </div>
  <div class="auth-form">
    <div style="text-align:center;margin-bottom:26px">
      <h2 style="font-size:26px;font-weight:700">Welcome Back!</h2>
      <p style="font-size:14px;color:var(--muted);margin-top:6px">Sign in to continue to split4me</p>
    </div>
    <button class="btn btn-outline" style="width:100%;justify-content:center;font-weight:600">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Continue with Google
    </button>
    <div style="display:flex;align-items:center;gap:14px;margin:22px 0;color:var(--muted);font-size:13px"><span style="flex:1;height:1px;background:var(--line)"></span>or<span style="flex:1;height:1px;background:var(--line)"></span></div>
    <div class="field"><label>Email address <span class="chip chip-y" style="padding:3px 10px;font-size:11px;margin-left:6px">Last used</span></label><input type="email" placeholder="Enter your email address"></div>
    <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:20px">Continue →</button>
    <p style="text-align:center;font-size:14px;color:var(--muted);margin-top:20px">Don't have an account? <a href="#" style="color:var(--text);font-weight:600">Sign up</a></p>
  </div>
 </div>
</div>
`});

SCREENS.push({ n:3, slug:'signup', title:'Sign Up', label:'Sign Up', html:`
<div class="wrap" style="padding-top:48px;padding-bottom:90px">
 <div class="auth-grid">
  <div class="auth-side">
   <div class="blob" style="width:300px;height:300px;background:var(--teal);top:-80px;left:-80px"></div>
   <div class="blob" style="width:240px;height:240px;background:var(--yellow);bottom:-60px;right:-60px"></div>
   <a class="wlogo" href="#" style="color:#F1EFE8;position:relative"><span class="mark">💸</span> split4me</a>
   <h2 style="font-size:34px;font-weight:800;line-height:1.15;margin:auto 0 20px;position:relative;padding-top:36px">Start splitting<br>in 30 seconds.</h2>
   <blockquote>"Finally an app that makes splitting fair — and actually fun."</blockquote>
   <div class="who">— Birthday Party · 8 members · settled up</div>
  </div>
  <div class="auth-form">
    <div style="text-align:center;margin-bottom:24px">
      <span class="chip chip-p" style="margin-bottom:14px">🚀 New here?</span>
      <h2 style="font-size:26px;font-weight:700">Create Account</h2>
      <p style="font-size:14px;color:var(--muted);margin-top:6px">Join split4me and start splitting bills</p>
    </div>
    <button class="btn btn-outline" style="width:100%;justify-content:center;font-weight:600">
      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      Continue with Google
    </button>
    <div style="display:flex;align-items:center;gap:14px;margin:22px 0;color:var(--muted);font-size:13px"><span style="flex:1;height:1px;background:var(--line)"></span>or<span style="flex:1;height:1px;background:var(--line)"></span></div>
    <div class="field"><label>Full name</label><input type="text" placeholder="Enter your full name"></div>
    <div class="field"><label>Email address</label><input type="email" placeholder="Enter your email address"></div>
    <div class="field"><label>Password</label><input type="password" placeholder="Create a password"></div>
    <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:20px;background:var(--purple);color:var(--text)">Create Account →</button>
    <p style="text-align:center;font-size:14px;color:var(--muted);margin-top:20px">Already have an account? <a href="#" style="color:var(--text);font-weight:600">Sign in</a></p>
  </div>
 </div>
</div>
`});

SCREENS.push({ n:4, slug:'dashboard', title:'Dashboard', label:'Dashboard — Previous Trips & Events', html:`
<div class="topbar">
  <div><h1 style="font-size:22px;font-weight:700">Good morning, <span style="color:var(--purple-ink)">Mank Kasep</span> 👋</h1><div style="font-size:13px;color:var(--muted)">Here's what's happening across your trips</div></div>
  <div class="actions" style="display:flex;gap:12px;align-items:center">
    <div class="search" style="width:300px">🔍 Search groups &amp; expenses</div>
    <button class="btn btn-dark">＋ New Group</button>
  </div>
</div>
<div class="hero-band">
  <div><div style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--purple-ink)">Total balance · across all groups</div>
    <div style="font-size:38px;font-weight:800;letter-spacing:-1px;margin-top:4px">$45.50 <span style="font-size:14px;font-weight:600;color:var(--success)">you are owed</span></div></div>
  <div style="text-align:right;font-size:13px;font-weight:600;line-height:1.9"><span style="color:var(--success)">▲ $120.00 owed to you</span><br><span style="color:#B91C1C">▼ $74.50 you owe</span></div>
</div>
<div class="page-grid">
<div>
<div class="sum-grid" style="grid-template-columns:1fr 1fr;margin-bottom:26px">
  <div class="sum"><div class="lbl">This month</div><div class="val" style="font-size:26px">$320<span style="font-size:14px;font-weight:500">,00</span></div><div class="sub">12 expenses · 3 groups</div></div>
  <div class="sum"><div class="lbl">Your share</div><div class="val" style="font-size:26px;color:var(--success)">$85<span style="font-size:14px;font-weight:500">,25</span></div><div class="sub">26.6% of total</div></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Recent Groups</h2><div class="val">$45.50 <span style="font-size:14px;font-weight:500;color:var(--success)">you are owed</span></div>
    <div style="display:flex;gap:18px;margin-top:10px;font-size:13px;font-weight:600"><span style="color:var(--success)">▲ $120.00 owed to you</span><span style="color:#B91C1C">▼ $74.50 you owe</span></div></div>
  <div class="sum"><div class="lbl">Quick actions</div><div style="display:flex;gap:10px;margin-top:4px"><button class="btn btn-dark btn-sm" style="flex:1;justify-content:center">＋ Group</button></div><div style="height:10px"></div><button class="btn btn-yellow" style="width:100%;justify-content:center">🔗 Join / QR</button></div>
</div>
<div class="group-grid">
  <div class="gcard"><div class="top" style="background:var(--teal)"><span class="avatar avatar-lg" style="background:#fff">🏖️</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Bali Trip 2025</b><b>$2.450</b></div><div class="meta"><span>6 members · 12 expenses</span><span>You're owed</span></div></div></div>
  <div class="gcard"><div class="top" style="background:var(--purple-l)"><span class="avatar avatar-lg" style="background:#fff">🏠</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Roommates</b><b>$890</b></div><div class="meta"><span>3 members · 28 expenses</span><span>You owe</span></div></div></div>
  <div class="gcard"><div class="top" style="background:var(--yellow)"><span class="avatar avatar-lg" style="background:#fff">🎉</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Birthday Party</b><b>$320</b></div><div class="meta"><span>8 members · 5 expenses</span><span>Settled up</span></div></div></div>
</div>
</div>
<aside class="side-card">
  <div class="card" style="padding:22px;margin-bottom:20px"><h3 style="font-size:15px;font-weight:700;margin-bottom:14px">Recent Activity</h3>
    <div style="font-size:13px;line-height:1.7;color:var(--muted)"><b style="color:var(--text)">Mank Kasep</b> added <b style="color:var(--text)">Lunch at Warung</b> · $15.50<br><span style="font-size:11px">2 h ago</span></div>
    <div style="height:12px"></div>
    <div style="font-size:13px;line-height:1.7;color:var(--muted)"><b style="color:var(--text)">Rehan</b> paid <b style="color:var(--text)">$12.50</b><br><span style="font-size:11px">Yesterday</span></div>
    <a href="#" style="display:block;text-align:right;font-size:13px;font-weight:600;margin-top:14px">View all →</a></div>
  <div class="card" style="padding:22px;background:linear-gradient(135deg,var(--teal),var(--purple-l))"><h3 style="font-size:15px;font-weight:700;color:var(--teal-ink)">Plan something new?</h3><p style="font-size:13px;color:var(--muted);margin:8px 0 14px">Create a group for your next trip or flat.</p><button class="btn btn-sm btn-dark">＋ New Event</button></div>
</aside>
</div>
`});

SCREENS.push({ n:5, slug:'split-detail', title:'Split The Bill', label:'Split The Bill', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Split The Bill</h1><div style="font-size:13px;color:var(--muted)">Bali Trip 2025</div></div><div class="actions"><button class="btn btn-primary">Split Now</button></div></div>
<div class="sum-grid" style="grid-template-columns:1fr 1fr;margin-bottom:26px">
  <div class="sum"><div class="lbl">My Balance</div><div class="val">$40.000<span>,00</span></div></div>
  <div class="sum"><div class="lbl">Total Bill</div><div class="val">$20.15<span>,00</span></div></div>
</div>
<div class="card" style="margin-bottom:26px;display:flex;align-items:center;justify-content:space-between;gap:24px">
  <div><div class="lbl" style="color:var(--muted);font-size:13px;margin-bottom:10px">Split With</div>
    <div style="display:flex;align-items:center;gap:10px"><div class="av-stack"><span class="avatar" style="background:var(--yellow)">🧑</span><span class="avatar" style="background:var(--purple-l)">👩</span><span class="avatar" style="background:var(--teal)">🧔</span><span class="avatar" style="background:var(--yellow)">👨</span></div><span class="avatar" style="background:var(--bg);color:var(--muted)">+</span></div></div>
  <button class="btn btn-dark">Split Now</button>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Nearby Friend</h2>
<div class="grid-3" style="margin-bottom:26px">
  <div class="card" style="text-align:center;padding:22px"><span class="avatar avatar-lg" style="background:var(--teal);margin:0 auto 10px">🧑</span><div style="font-weight:600">Jhony</div><button class="btn btn-sm btn-primary" style="margin-top:12px">＋</button></div>
  <div class="card" style="text-align:center;padding:22px"><span class="avatar avatar-lg" style="background:var(--purple-l);margin:0 auto 10px">👩</span><div style="font-weight:600">Rehan</div><button class="btn btn-sm btn-primary" style="margin-top:12px">＋</button></div>
  <div class="card" style="text-align:center;padding:22px"><span class="avatar avatar-lg" style="background:var(--yellow);margin:0 auto 10px">🧔</span><div style="font-weight:600">Ujang</div><button class="btn btn-sm btn-primary" style="margin-top:12px">＋</button></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Detail Split Bill</h2>
<div class="list">
  <div class="row"><span class="avatar" style="background:var(--yellow)">🧑</span><div class="grow"><div class="t">Mank Kasep</div><div class="s">20%</div></div><div class="amt">$5.15<span style="font-size:12px;color:var(--muted)">,00</span></div></div>
  <div class="row"><span class="avatar" style="background:var(--purple-l)">👩</span><div class="grow"><div class="t">Andi Saputra</div><div class="s">30%</div></div><div class="amt">$7.05<span style="font-size:12px;color:var(--muted)">,00</span></div></div>
  <div class="row" style="border:none"><span class="avatar" style="background:var(--teal)">🧔</span><div class="grow"><div class="t">You</div><div class="s">50%</div></div><div class="amt" style="color:var(--success)">$7.95<span style="font-size:12px">,00</span></div></div>
</div>
`});

SCREENS.push({ n:6, slug:'expenses', title:'Expenses', label:'Expenses List', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Bali Trip 2025</h1><div style="font-size:13px;color:var(--muted)">Your balance <b style="color:var(--success)">+$45.50</b></div></div><div class="actions"><button class="btn btn-primary">＋ New Expense</button></div></div>
<div class="tabs" style="margin-bottom:24px"><a class="active">Expenses</a><a>Balances</a><a>Stats</a></div>
<div class="list">
  <div class="grp-lbl" style="padding:14px 18px 4px;font-size:12px;color:var(--muted);font-weight:600">Today</div>
  <div class="row"><span class="avatar" style="background:var(--yellow)">🍔</span><div class="grow"><div class="t">Lunch at Warung</div><div class="s">Paid by You · Split 3 ways</div></div><div style="text-align:right"><div class="amt">$15.50<span style="font-size:12px;color:var(--muted)">,00</span></div><div class="s" style="font-size:11px;color:var(--muted)">Today</div></div></div>
  <div class="row"><span class="avatar" style="background:var(--teal)">🚕</span><div class="grow"><div class="t">Taxi to Beach</div><div class="s">Paid by Jhony · Split 4 ways</div></div><div style="text-align:right"><div class="amt" style="color:var(--success)">+$8.25<span style="font-size:12px">,00</span></div><div class="s" style="font-size:11px;color:var(--muted)">Today</div></div></div>
  <div class="row"><span class="avatar" style="background:var(--purple-l)">🏨</span><div class="grow"><div class="t">Hotel Booking</div><div class="s">Paid by You · Split 4 ways</div></div><div style="text-align:right"><div class="amt">$120.00<span style="font-size:12px;color:var(--muted)">,00</span></div><div class="s" style="font-size:11px;color:var(--muted)">Today</div></div></div>
  <div class="grp-lbl" style="padding:18px 18px 4px;font-size:12px;color:var(--muted);font-weight:600;border-top:1px solid var(--line)">Yesterday</div>
  <div class="row"><span class="avatar" style="background:var(--yellow)">🛍️</span><div class="grow"><div class="t">Souvenir Shopping</div><div class="s">Paid by Rehan · Split 3 ways</div></div><div style="text-align:right"><div class="amt" style="color:var(--success)">+$18.75<span style="font-size:12px">,00</span></div><div class="s" style="font-size:11px;color:var(--muted)">Yesterday</div></div></div>
  <div class="row" style="border:none"><span class="avatar" style="background:var(--teal)">🍽️</span><div class="grow"><div class="t">Dinner at Jimbaran</div><div class="s">Paid by Ujang · Split 4 ways</div></div><div style="text-align:right"><div class="amt" style="color:var(--success)">+$32.00<span style="font-size:12px">,00</span></div><div class="s" style="font-size:11px;color:var(--muted)">Yesterday</div></div></div>
</div>
`});

SCREENS.push({ n:7, slug:'create-expense', title:'New Expense', label:'Create Expense', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">New Expense</h1><div style="font-size:13px;color:var(--muted)">Bali Trip 2025</div></div></div>
<div class="form-card" style="max-width:640px">
  <div class="field"><label>Expense name</label><input type="text" value="Lunch at Warung"></div>
  <div class="field"><label>Amount</label><div style="position:relative"><span style="position:absolute;left:16px;top:50%;transform:translateY(-50%);font-weight:600">$</span><input type="text" value="15.50" style="padding-left:34px"></div></div>
  <div class="two-col">
    <div class="field"><label>Category</label><select><option>🍔 Food &amp; Drink</option></select></div>
    <div class="field"><label>Date</label><input type="text" value="Aug 23, 2025"></div>
  </div>
  <div class="field"><label>Paid by</label><select><option>You (Mank Kasep)</option></select></div>
  <div class="field"><label>Split with</label>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <span class="chip chip-p" style="padding:9px 16px">✓ You</span><span class="chip chip-p" style="padding:9px 16px">✓ Jhony</span><span class="chip chip-p" style="padding:9px 16px">✓ Rehan</span><span class="chip chip-soft" style="padding:9px 16px">Ujang</span>
    </div></div>
  <div class="sum" style="box-shadow:none;margin-top:6px"><div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--muted)">Split equally</span><b>$5.17 each</b></div><div style="display:flex;justify-content:space-between;font-size:14px;margin-top:8px"><span style="color:var(--muted)">Your share</span><b style="color:var(--text)">$5.17</b></div></div>
  <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:22px">Save Expense</button>
</div>
`});

SCREENS.push({ n:8, slug:'balances', title:'Balances & Settle Up', label:'Balances & Settle Up', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Balances</h1><div style="font-size:13px;color:var(--muted)">Bali Trip 2025</div></div><div class="actions"><button class="btn btn-dark">Settle Up</button></div></div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Who Owes What</h2>
<div class="list" style="margin-bottom:30px">
  <div class="row"><span class="avatar avatar-sm" style="background:var(--teal)">🧑</span><div class="grow"><div class="t">Jhony</div></div><div class="amt" style="color:var(--success)">Owes $12.50</div></div>
  <div class="row"><span class="avatar avatar-sm" style="background:var(--purple-l)">👩</span><div class="grow"><div class="t">Rehan</div></div><div class="amt" style="color:var(--danger)">Owes you $8.75</div></div>
  <div class="row" style="border:none"><span class="avatar avatar-sm" style="background:var(--yellow)">🧔</span><div class="grow"><div class="t">Ujang</div></div><div class="amt" style="color:var(--success)">Owes $24.25</div></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Suggested Settlements</h2>
<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;margin-bottom:14px">
  <div style="display:flex;align-items:center;gap:10px"><span class="avatar avatar-sm" style="background:var(--teal)">🧑</span><span style="color:var(--muted)">→</span><span class="avatar avatar-sm" style="background:var(--yellow)">🧔</span></div>
  <b>$12.50</b><button class="btn btn-sm btn-dark">Settle</button>
</div>
<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:var(--teal)">
  <div style="display:flex;align-items:center;gap:10px"><span class="avatar avatar-sm" style="background:#fff">👩</span><span style="color:var(--teal-ink)">→</span><span class="avatar avatar-sm" style="background:#fff">🧔</span></div>
  <b style="color:var(--teal-ink)">$8.75</b><button class="btn btn-sm btn-dark">Settle</button>
</div>
`});

SCREENS.push({ n:9, slug:'stats', title:'Statistics', label:'Statistics', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Statistics</h1><div style="font-size:13px;color:var(--muted)">Bali Trip 2025</div></div></div>
<div class="tabs" style="margin-bottom:24px"><a class="active">This Month</a><a>3 Months</a><a>All Time</a></div>
<div class="two-col" style="margin-bottom:30px">
  <div class="sum"><div class="lbl">Total Expenses</div><div class="val" style="color:var(--text)">$320<span style="font-size:14px;font-weight:500">,00</span></div><div class="sub">12 expenses</div></div>
  <div class="sum"><div class="lbl">Your Share</div><div class="val" style="color:var(--success)">$85<span style="font-size:14px;font-weight:500">,25</span></div><div class="sub">26.6% of total</div></div>
</div>
<div class="card" style="margin-bottom:30px">
  <h3 style="font-size:16px;font-weight:700;margin-bottom:22px">Spending Over Time</h3>
  <div class="bars">
    <div class="bar t" style="height:40%"><span class="bl">Mon</span></div><div class="bar" style="height:65%"><span class="bl">Tue</span></div><div class="bar t" style="height:30%"><span class="bl">Wed</span></div><div class="bar" style="height:85%"><span class="bl">Thu</span></div><div class="bar y" style="height:55%"><span class="bl">Fri</span></div><div class="bar" style="height:95%;background:var(--dark)"><span class="bl">Sat</span></div><div class="bar t" style="height:45%"><span class="bl">Sun</span></div>
  </div>
</div>
<div class="card">
  <h3 style="font-size:16px;font-weight:700;margin-bottom:20px">By Category</h3>
  <div class="row"><span class="avatar avatar-sm" style="background:var(--yellow);border-radius:12px">🍔</span><div class="grow"><div class="t">Food &amp; Drink</div><div style="height:8px;background:var(--bg);border-radius:10px;margin-top:8px"><div style="width:75%;height:100%;background:var(--yellow-d);border-radius:10px"></div></div></div><div class="amt">$145.00</div></div>
  <div class="row"><span class="avatar avatar-sm" style="background:var(--teal);border-radius:12px">🚕</span><div class="grow"><div class="t">Transport</div><div style="height:8px;background:var(--bg);border-radius:10px;margin-top:8px"><div style="width:40%;height:100%;background:var(--teal-d);border-radius:10px"></div></div></div><div class="amt">$65.00</div></div>
  <div class="row"><span class="avatar avatar-sm" style="background:var(--purple-l);border-radius:12px">🏨</span><div class="grow"><div class="t">Accommodation</div><div style="height:8px;background:var(--bg);border-radius:10px;margin-top:8px"><div style="width:55%;height:100%;background:var(--purple);border-radius:10px"></div></div></div><div class="amt">$95.00</div></div>
  <div class="row" style="border:none"><span class="avatar avatar-sm" style="background:var(--yellow);border-radius:12px">🛍️</span><div class="grow"><div class="t">Shopping</div><div style="height:8px;background:var(--bg);border-radius:10px;margin-top:8px"><div style="width:18%;height:100%;background:var(--yellow-d);border-radius:10px"></div></div></div><div class="amt">$15.00</div></div>
</div>
`});

SCREENS.push({ n:10, slug:'group-info', title:'Group Info', label:'Group Information', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Group Info</h1></div><div class="actions"><button class="btn btn-outline" style="color:#B91C1C;border-color:var(--danger)">Leave Group</button></div></div>
<div class="center" style="margin-bottom:30px">
  <span class="avatar" style="width:72px;height:72px;border-radius:24px;background:var(--teal);font-size:36px;margin:0 auto 12px;display:flex">🏖️</span>
  <h2 style="font-size:22px;font-weight:700">Bali Trip 2025</h2>
  <p style="font-size:13px;color:var(--muted);margin-top:4px">Created by Mank Kasep</p>
</div>
<div class="two-col" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:30px">
  <div class="sum"><div class="lbl">Currency</div><div class="val" style="font-size:20px">USD ($)</div></div>
  <div class="sum"><div class="lbl">Created</div><div class="val" style="font-size:20px">Aug 15, 2025</div></div>
  <div class="sum"><div class="lbl">Total Expenses</div><div class="val" style="font-size:20px">12</div></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Members (4)</h2>
<div class="list" style="max-width:640px">
  <div class="row"><span class="avatar" style="background:var(--yellow)">🧑</span><div class="grow"><div class="t">Mank Kasep</div><div class="s">Owner</div></div></div>
  <div class="row"><span class="avatar" style="background:var(--teal)">🧑</span><div class="grow"><div class="t">Jhony</div><div class="s">jhony@email.com</div></div></div>
  <div class="row"><span class="avatar" style="background:var(--purple-l)">👩</span><div class="grow"><div class="t">Rehan</div><div class="s">rehan@email.com</div></div></div>
  <div class="row" style="border:none"><span class="avatar" style="background:var(--yellow)">🧔</span><div class="grow"><div class="t">Ujang</div><div class="s">ujang@email.com</div></div></div>
</div>
`});

SCREENS.push({ n:11, slug:'activity', title:'Activity', label:'Activity Log', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Activity</h1><div style="font-size:13px;color:var(--muted)">Bali Trip 2025</div></div></div>
<div class="list" style="max-width:760px">
  <div class="grp-lbl" style="padding:14px 18px 4px;font-size:12px;color:var(--muted);font-weight:600">Today</div>
  <div class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--success);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Mank Kasep</b> added expense <b>"Lunch at Warung"</b> for $15.50</div><div class="s">2 hours ago</div></div></div>
  <div class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--purple);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Jhony</b> joined the group</div><div class="s">4 hours ago</div></div></div>
  <div class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--success);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Rehan</b> added expense <b>"Taxi to Beach"</b> for $8.25</div><div class="s">5 hours ago</div></div></div>
  <div class="grp-lbl" style="padding:18px 18px 4px;font-size:12px;color:var(--muted);font-weight:600;border-top:1px solid var(--line)">Yesterday</div>
  <div class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--yellow-d);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Mank Kasep</b> edited expense <b>"Hotel Booking"</b></div><div class="s">Yesterday, 6:30 PM</div></div></div>
  <div class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--success);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Ujang</b> added expense <b>"Dinner at Jimbaran"</b> for $32.00</div><div class="s">Yesterday, 8:15 PM</div></div></div>
  <div class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--purple);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Rehan</b> paid <b>$12.50</b> to Mank Kasep</div><div class="s">Yesterday, 3:00 PM</div></div></div>
  <div class="row" style="border:none"><span style="width:10px;height:10px;border-radius:50%;background:var(--success);flex-shrink:0"></span><div class="grow"><div class="t" style="font-weight:400"><b>Mank Kasep</b> created the group <b>"Bali Trip 2025"</b></div><div class="s">Aug 15, 10:00 AM</div></div></div>
</div>
`});

SCREENS.push({ n:12, slug:'ocr-preview', title:'Receipt Scan (OCR)', label:'OCR Receipt Preview', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Receipt scanned successfully</h1><div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--success);font-weight:600;margin-top:4px"><span style="width:9px;height:9px;border-radius:50%;background:var(--success);display:inline-block"></span>AI extracted all items</div></div><div class="actions"><button class="btn btn-outline">✏️ Edit</button><button class="btn btn-dark">＋ Add Item</button></div></div>
<div class="hero-grid" style="grid-template-columns:1fr 1fr;align-items:start">
  <div class="receipt" style="max-width:none">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
      <span class="avatar" style="background:#DC2626;color:#fff;border-radius:14px">M</span>
      <div style="flex:1"><div style="font-weight:800;font-size:18px">McDonald's</div><div style="font-size:12px;color:var(--muted)">Baton Rouge, LA</div></div>
      <span class="chip chip-t" style="padding:5px 12px;font-size:11px">3/4 Paid</span>
    </div>
    <div style="border-top:1px dashed var(--line);margin:14px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span style="color:var(--muted)">Bill No. :</span><span>#N3004</span></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span style="color:var(--muted)">Date :</span><span>04-09-2022</span></div>
    <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0"><span style="color:var(--muted)">Paid by :</span><span>John Sans</span></div>
    <div style="border-top:1px dashed var(--line);margin:14px 0"></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0"><span>1. Chicken Burger x2</span><span>$50.00</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0"><span>2. Cheese Burger x2</span><span>$30.00</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0"><span>3. Fries XL x3</span><span>$25.00</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0"><span>4. Pizza Puff x3</span><span>$30.00</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;padding:5px 0"><span>5. Coke XL x5</span><span>$75.00</span></div>
    <div style="border-top:1px dashed var(--line);margin:14px 0"></div>
    <div style="display:flex;justify-content:space-between;font-weight:800;font-size:17px"><span>Grand Total</span><span>$210.00</span></div>
    <div style="border-top:1px dashed var(--line);margin:14px 0"></div>
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:6px"><span class="avatar avatar-sm" style="background:var(--teal)">🧑</span><span class="avatar avatar-sm" style="background:var(--purple-l);margin-left:-14px">👩</span><span class="avatar avatar-sm" style="background:var(--yellow);margin-left:-14px">🧔</span><span class="avatar avatar-sm" style="background:var(--teal);margin-left:-14px">👨</span></div>
      <a href="#" style="font-size:13px;font-weight:600">See Details →</a>
    </div>
    <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:18px">👁 View Bill</button>
  </div>
  <div>
    <div class="sum" style="margin-bottom:20px">
      <div class="lbl">Your Share to pay</div>
      <div class="val" style="font-size:34px">$52.50</div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:16px">Pay Now</button>
    </div>
    <div class="card"><div style="font-size:13px;color:var(--muted)">Scanned items are matched to this group's members. Tap an item to reassign who ate what before confirming.</div></div>
  </div>
</div>
`});

SCREENS.push({ n:13, slug:'split-now', title:'Split Now — Sliders', label:'Split Now — Custom Amount Sliders', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Split Now</h1><div style="font-size:13px;color:var(--muted)">Drag the sliders to adjust each share</div></div></div>
<div class="card" style="margin-bottom:26px;display:flex;align-items:center;justify-content:space-between;gap:20px">
  <span class="chip chip-y">Receipt</span>
  <div style="flex:1;display:flex;justify-content:space-around;text-align:center">
    <div><div style="font-size:12px;color:var(--muted)">Title</div><b style="font-size:17px">Team Dinner</b></div>
    <div><div style="font-size:12px;color:var(--muted)">Total Bill</div><b style="font-size:17px">$1250.86</b></div>
  </div>
  <div style="display:flex;align-items:center;gap:8px"><div class="av-stack"><span class="avatar avatar-sm" style="background:var(--purple)"></span><span class="avatar avatar-sm" style="background:var(--teal)"></span><span class="avatar avatar-sm" style="background:var(--yellow)"></span></div><span style="font-size:12px;color:var(--muted)">Splitting With</span></div>
</div>
<div class="list" style="max-width:760px;margin-bottom:26px">
  <div class="row" style="flex-direction:column;align-items:stretch;gap:12px;padding:20px 18px">
    <div style="display:flex;align-items:center;gap:12px"><span class="avatar avatar-sm" style="background:var(--purple)">🧑</span><b style="flex:1">You</b><span class="amt">$200.86</span></div>
    <div style="height:10px;border-radius:10px;background:var(--bg);position:relative"><div style="width:28%;height:100%;border-radius:10px;background:var(--teal)"></div><span style="position:absolute;left:28%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--teal)"></span></div>
  </div>
  <div class="row" style="flex-direction:column;align-items:stretch;gap:12px;padding:20px 18px">
    <div style="display:flex;align-items:center;gap:12px"><span class="avatar avatar-sm" style="background:var(--success);color:#fff">🧑</span><b style="flex:1">Jhony</b><span class="amt">$450.00</span></div>
    <div style="height:10px;border-radius:10px;background:var(--bg);position:relative"><div style="width:65%;height:100%;border-radius:10px;background:var(--success)"></div><span style="position:absolute;left:65%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--success)"></span></div>
  </div>
  <div class="row" style="flex-direction:column;align-items:stretch;gap:12px;padding:20px 18px;border:none">
    <div style="display:flex;align-items:center;gap:12px"><span class="avatar avatar-sm" style="background:var(--yellow-d)">👩</span><b style="flex:1">Rehan</b><span class="amt">$600.00</span></div>
    <div style="height:10px;border-radius:10px;background:var(--bg);position:relative"><div style="width:85%;height:100%;border-radius:10px;background:var(--yellow-d)"></div><span style="position:absolute;left:85%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--yellow-d)"></span></div>
  </div>
</div>
<button class="btn btn-dark" style="padding:18px 60px;font-size:16px">Confirm Split</button>
`});

SCREENS.push({ n:14, slug:'create-group', title:'Create Group', label:'Create Group', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">New Group</h1></div></div>
<div class="form-card" style="max-width:640px">
  <div class="field"><label>Group name</label><input type="text" value="Bali Trip 2025" placeholder="e.g. Bali Trip 2025"></div>
  <div class="two-col">
    <div class="field"><label>Currency</label><select><option>🇺🇸 USD ($)</option><option>🇪🇺 EUR (€)</option><option>🇬🇧 GBP (£)</option><option>🇮🇩 IDR (Rp)</option></select></div>
    <div class="field"><label>Theme color</label><div style="display:flex;gap:12px;padding-top:4px"><span class="avatar avatar-sm" style="background:var(--yellow);border:3px solid var(--text)">✓</span><span class="avatar avatar-sm" style="background:var(--purple)"></span><span class="avatar avatar-sm" style="background:var(--teal)"></span><span class="avatar avatar-sm" style="background:#FCE8E6"></span></div></div>
  </div>
  <div class="field"><label>Description <span class="chip chip-soft" style="padding:3px 10px;font-size:11px">optional</span></label><input type="text" placeholder="What is this group for?"></div>
  <div class="field"><label>Members</label>
    <div class="list" style="box-shadow:none;border:none">
      <div class="row" style="padding:12px 0"><span class="avatar avatar-sm" style="background:var(--teal)">🧑</span><div class="grow"><div class="t">You</div><div class="s">Owner</div></div></div>
      <div class="row" style="padding:12px 0;border:none"><span class="avatar avatar-sm" style="background:var(--purple-l)">👩</span><div class="grow"><div class="t">Rehan</div><div class="s">invited</div></div><span style="color:var(--muted);cursor:pointer">🗑</span></div>
    </div>
    <div class="row" style="padding:12px 0;border-top:1px solid var(--line)"><span class="avatar avatar-sm" style="background:var(--yellow)">🧔</span><div class="grow"><div class="t">Ujang</div><div class="s">invited</div></div><span style="color:var(--muted);cursor:pointer">🗑</span></div>
    <button class="btn btn-outline btn-sm" style="margin-top:10px">＋ Invite by email or link</button>
  </div>
  <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:22px">Create Group</button>
</div>
`});

SCREENS.push({ n:15, slug:'split-modes', title:'Split Modes', label:'Split Modes — Evenly / Shares / % / Amount', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Split Expense</h1><div style="font-size:13px;color:var(--muted)">Choose how to divide $45.00</div></div></div>
<div class="tabs" style="margin-bottom:24px"><a class="active">Equally</a><a>Shares</a><a>%</a><a>Amount</a></div>
<div class="sum" style="max-width:640px;margin-bottom:26px">
  <div style="display:flex;justify-content:space-between;font-size:14px"><span style="color:var(--muted)">Total amount</span><b>$45.00</b></div>
  <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:8px"><span style="color:var(--muted)">Split equally · 3 people</span><b>$15.00 each</b></div>
</div>
<div class="form-card" style="max-width:640px">
  <div class="field"><label>Assign shares</label>
    <div class="row" style="padding:12px 0;border:none"><span class="avatar avatar-sm" style="background:var(--teal)">🧑</span><div class="grow"><div class="t">You</div></div><input class="fld-num" type="text" value="1" style="width:70px;text-align:center;padding:9px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-family:inherit"></div>
    <div class="row" style="padding:12px 0"><span class="avatar avatar-sm" style="background:var(--purple-l)">👩</span><div class="grow"><div class="t">Rehan</div></div><input type="text" value="2" style="width:70px;text-align:center;padding:9px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-family:inherit"></div>
    <div class="row" style="padding:12px 0;border:none"><span class="avatar avatar-sm" style="background:var(--yellow)">🧔</span><div class="grow"><div class="t">Ujang</div></div><input type="text" value="1" style="width:70px;text-align:center;padding:9px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-family:inherit"></div>
  </div>
  <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted);font-weight:500;margin:16px 0 22px;cursor:pointer"><span style="width:18px;height:18px;border-radius:6px;background:var(--purple);display:inline-block"></span>Save as default splitting option</label>
  <button class="btn btn-dark" style="width:100%;justify-content:center">Save Expense</button>
</div>
`});

SCREENS.push({ n:16, slug:'receipt-scan', title:'Scan Receipt', label:'Receipt Scan & AI Draft Review', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Scan Receipt</h1></div></div>
<div class="hero-grid" style="grid-template-columns:1fr 1fr;align-items:start">
  <div class="card" style="padding:28px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px"><b style="font-size:16px">Upload Receipt</b><span class="chip chip-y" style="padding:4px 12px;font-size:11px">BETA</span></div>
    <div style="border:2px dashed var(--line);border-radius:20px;padding:38px 20px;text-align:center;margin-bottom:18px">
      <div style="font-size:34px;margin-bottom:10px">📸</div>
      <div style="font-weight:600;font-size:15px">Take a photo or upload</div>
      <div style="font-size:13px;color:var(--muted);margin-top:4px">We'll read the items &amp; total for you</div>
      <div style="font-size:12px;color:var(--muted);margin-top:12px">JPEG · PNG · WebP · max 5MB</div>
    </div>
    <button class="btn btn-dark" style="width:100%;justify-content:center">Analyze Receipt</button>
  </div>
  <div>
    <div style="font-size:13px;color:var(--muted);font-weight:600;margin-bottom:12px">AI extracted →</div>
    <div class="receipt" style="max-width:none">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px"><span class="avatar" style="background:var(--yellow);border-radius:14px">🧾</span><div class="field" style="flex:1;margin:0"><input type="text" value="Warung Made" style="padding:10px 12px"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;padding:8px 0;border-bottom:1px dashed var(--line)"><span>Nasi Goreng <span style="color:var(--muted);font-size:12px">· A-2</span></span><b>$8.00</b></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;padding:8px 0;border-bottom:1px dashed var(--line)"><span>Ice Tea <span style="color:var(--muted);font-size:12px">· A-3</span></span><b>$4.50</b></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;padding:8px 0"><span>Sate Ayam <span style="color:var(--muted);font-size:12px">· A-1</span></span><b>$6.00</b></div>
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:16px;margin-top:10px"><span>Total</span><span>$18.50</span></div>
      <button class="btn btn-outline btn-sm" style="width:100%;justify-content:center;margin-top:16px">Edit in full form</button>
      <button class="btn btn-dark" style="width:100%;justify-content:center;margin-top:10px">Confirm &amp; Add</button>
    </div>
  </div>
</div>
`});

SCREENS.push({ n:17, slug:'group-settings', title:'Group Settings', label:'Group Settings', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">Group Settings</h1><div style="font-size:13px;color:var(--muted)">Bali Trip 2025</div></div></div>
<div class="form-card" style="max-width:640px">
  <div class="field"><label>Group name</label><input type="text" value="Bali Trip 2025"></div>
  <div class="two-col">
    <div class="field"><label>Currency</label><select><option>🇺🇸 USD ($)</option></select></div>
    <div class="field"><label>Theme color</label><div style="display:flex;gap:12px;padding-top:4px"><span class="avatar avatar-sm" style="background:var(--yellow)"></span><span class="avatar avatar-sm" style="background:var(--teal);border:3px solid var(--text)">✓</span><span class="avatar avatar-sm" style="background:var(--purple)"></span></div></div>
  </div>
  <div class="field"><label>Description</label><input type="text" value="Our 2025 Bali adventure"></div>
  <div class="field"><label>Members</label>
    <div class="row" style="padding:12px 0;border:none"><span class="avatar avatar-sm" style="background:var(--teal)">🧑</span><div class="grow"><div class="t">You</div><div class="s">Owner</div></div></div>
    <div class="row" style="padding:12px 0"><span class="avatar avatar-sm" style="background:var(--purple-l)">👩</span><div class="grow"><div class="t">Rehan</div><div class="s">2 expenses</div></div><span style="color:var(--faint)" title="Has expenses">🗑</span></div>
    <div class="row" style="padding:12px 0;border:none"><span class="avatar avatar-sm" style="background:var(--yellow)">🧔</span><div class="grow"><div class="t">Ujang</div><div class="s">no expenses</div></div><span style="color:var(--muted);cursor:pointer">🗑</span></div>
    <button class="btn btn-outline btn-sm" style="margin-top:8px">＋ Invite member</button>
  </div>
  <div style="display:flex;gap:14px;margin-top:24px">
    <button class="btn btn-outline" style="flex:1;justify-content:center">Archive</button>
    <button class="btn btn-dark" style="flex:2;justify-content:center;background:var(--danger)">Save Changes</button>
  </div>
</div>
`});

SCREENS.push({ n:18, slug:'empty-states', title:'Empty States', label:'Empty States (First-run)', html:`
<div class="topbar"><div><h1 style="font-size:22px;font-weight:700">My Groups</h1></div></div>
<div class="empty" style="padding:60px 20px">
  <div class="ic" style="background:var(--yellow)">👥</div>
  <h3>No groups yet</h3>
  <p>Create your first group to start splitting bills with friends and family.</p>
  <button class="btn btn-dark" style="padding:16px 34px">＋ Create Group</button>
  <div style="font-size:13px;color:var(--muted);margin-top:16px">or join with a link / QR code</div>
</div>
<div class="empty" style="padding:20px 20px 70px">
  <div class="ic" style="background:var(--teal)">🧾</div>
  <h3>No expenses yet</h3>
  <p>Add an expense or scan a receipt to keep track of who paid for what.</p>
</div>
`});

SCREENS.push({ n:19, slug:'dark-mode', title:'Dark Mode — Dashboard', label:'Dark Mode — Dashboard', html:`
<div class="topbar">
  <div><h1 style="font-size:22px;font-weight:700">Good morning, Mank Kasep 👋</h1><div style="font-size:13px;color:var(--muted)">Dark theme · yoru 夜</div></div>
  <div class="actions" style="display:flex;gap:12px;align-items:center">
    <div class="search" style="width:280px">🔍 Search groups &amp; expenses</div>
    <button class="btn btn-dark">＋ New Group</button>
  </div>
</div>
<div class="sum-grid" style="grid-template-columns:1.4fr 1fr;margin-bottom:26px">
  <div class="sum"><div class="lbl">Total balance across groups</div><div class="val">$45.50 <span style="font-size:14px;font-weight:500;color:var(--success)">you are owed</span></div></div>
  <div class="sum"><div class="lbl">This month</div><div class="val" style="font-size:24px">$320<span style="font-size:14px;font-weight:500">,00</span></div><div class="sub">12 expenses</div></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Recent groups</h2>
<div class="group-grid">
  <div class="gcard"><div class="top" style="background:var(--teal)"><span class="avatar avatar-lg" style="background:#fff">🏖️</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Bali Trip 2025</b><b>$320</b></div><div class="meta"><span>4 members · 12 expenses</span></div></div></div>
  <div class="gcard"><div class="top" style="background:var(--purple)"><span class="avatar avatar-lg" style="background:#fff">🏠</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Roommates</b><b>$890</b></div><div class="meta"><span>3 members · 28 expenses</span></div></div></div>
  <div class="gcard"><div class="top" style="background:var(--yellow)"><span class="avatar avatar-lg" style="background:#fff">🎉</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Birthday Party</b><b>$320</b></div><div class="meta"><span>8 members · 5 expenses</span></div></div></div>
</div>
`});

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
  `<section class="wsec" id="s${s.n}">\n<div class="wlabel">Screen ${s.n} <span>${s.label}</span></div>\n<div class="scr">\n${s.html}\n</div>\n</section>`
).join('\n');
const preview = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>split4me — Web UI Preview (All Screens)</title>\n<style>\n${WEB_CSS}\n</style>\n</head>\n<body class="prev-body">\n<nav class="prev-nav"><span class="lab">split4me · Web</span>${SCREENS.map(s=>`<a href="#s${s.n}">${s.n}. ${s.title}</a>`).join('<span class="sep">·</span>')}</nav>\n${sections}\n</body>\n</html>\n`;
fs.writeFileSync(path.join(root, 'ui-preview-web.html'), preview, 'utf8');
console.log('Wrote ui-preview-web.html');
console.log(`\nDone. ${count} web screen files + 1 preview written.`);
