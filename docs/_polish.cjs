// Web polish pass v2 — retains PWA tokens/typography; upgrades depth, layout, hierarchy.
const fs = require('fs');
let src = fs.readFileSync('docs/gen-web.cjs', 'utf8');

function must(from, to) {
  const parts = src.split(from);
  if (parts.length !== 2) throw new Error('anchor x' + (parts.length - 1) + ': ' + from.slice(0, 70));
  src = parts.join(to);
}

/* ---------- A. global polish layer ---------- */
must('/* ---------- Dark app theme',
`/* ---------- Polish layer v2 ---------- */
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

/* ---------- Dark app theme`);

/* ---------- B. auth -> split panel ---------- */
must(`<div class="wrap center" style="padding-top:70px;padding-bottom:80px">
  <div class="form-card" style="margin:0 auto">
    <div style="text-align:center;margin-bottom:26px">
      <a class="wlogo" href="#" style="justify-content:center;display:inline-flex;margin-bottom:18px"><span class="mark">💸</span> split4me</a>
      <h2 style="font-size:26px;font-weight:700">Welcome Back!</h2>
      <p style="font-size:14px;color:var(--muted);margin-top:6px">Sign in to continue to split4me</p>
    </div>`,
`<div class="wrap" style="padding-top:48px;padding-bottom:90px">
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
    </div>`);

must(`<p style="text-align:center;font-size:14px;color:var(--muted);margin-top:20px">Don't have an account? <a href="#" style="color:var(--text);font-weight:600">Sign up</a></p>
  </div>
</div>`,
`<p style="text-align:center;font-size:14px;color:var(--muted);margin-top:20px">Don't have an account? <a href="#" style="color:var(--text);font-weight:600">Sign up</a></p>
  </div>
 </div>
</div>`);

/* signup */
must(`<div class="wrap center" style="padding-top:60px;padding-bottom:80px">
  <div class="form-card" style="margin:0 auto">
    <div style="text-align:center;margin-bottom:24px">`,
`<div class="wrap" style="padding-top:48px;padding-bottom:90px">
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
    <div style="text-align:center;margin-bottom:24px">`);

must(`<p style="text-align:center;font-size:14px;color:var(--muted);margin-top:20px">Already have an account? <a href="#" style="color:var(--text);font-weight:600">Sign in</a></p>
  </div>
</div>`,
`<p style="text-align:center;font-size:14px;color:var(--muted);margin-top:20px">Already have an account? <a href="#" style="color:var(--text);font-weight:600">Sign in</a></p>
  </div>
 </div>
</div>`);

/* ---------- C. dashboard: hero band + 2-col with activity side ---------- */
must(`<div class="sum-grid" style="grid-template-columns:1.4fr 1fr 1fr;margin-bottom:26px">
  <div class="sum"><div class="lbl">Your total balance · Across all groups</div>`,
`<div class="hero-band">
  <div><div style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--purple-ink)">Total balance · across all groups</div>
    <div style="font-size:38px;font-weight:800;letter-spacing:-1px;margin-top:4px">$45.50 <span style="font-size:14px;font-weight:600;color:var(--success)">you are owed</span></div></div>
  <div style="text-align:right;font-size:13px;font-weight:600;line-height:1.9"><span style="color:var(--success)">▲ $120.00 owed to you</span><br><span style="color:var(--danger)">▼ $74.50 you owe</span></div>
</div>
<div class="page-grid">
<div>
<div class="sum-grid" style="grid-template-columns:1fr 1fr;margin-bottom:26px">
  <div class="sum"><div class="lbl">This month</div><div class="val" style="font-size:26px">$320<span style="font-size:14px;font-weight:500">,00</span></div><div class="sub">12 expenses · 3 groups</div></div>
  <div class="sum"><div class="lbl">Your share</div><div class="val" style="font-size:26px;color:var(--success)">$85<span style="font-size:14px;font-weight:500">,25</span></div><div class="sub">26.6% of total</div></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Recent Groups</h2>`);
// ^ repositions old balance sum out; remove leftover old sum-grid tail pieces below
must(`  <div class="sum"><div class="lbl">Quick action</div><button class="btn btn-yellow" style="width:100%;justify-content:center">🔗 Join / QR</button><div style="height:10px"></div><button class="btn btn-teal" style="width:100%;justify-content:center">＋ Add Event</button></div>
  <div class="sum"><div class="lbl">This month</div><div class="val" style="font-size:24px">$320<span style="font-size:14px;font-weight:500">,00</span></div><div class="sub">12 expenses · 4 groups</div></div>
</div>
<h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Recent Groups</h2>`,
`  <div class="sum"><div class="lbl">Quick actions</div><div style="display:flex;gap:10px;margin-top:4px"><button class="btn btn-dark btn-sm" style="flex:1;justify-content:center">＋ Group</button></div><div style="height:10px"></div><button class="btn btn-yellow" style="width:100%;justify-content:center">🔗 Join / QR</button></div>
</div>`);
// close left col, add activity aside before group-grid end of dashboard: anchor at its final gcard close + nothing else
must(`  <div class="gcard"><div class="top" style="background:var(--yellow)"><span class="avatar avatar-lg" style="background:#fff">🎉</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Birthday Party</b><b>$320</b></div><div class="meta"><span>8 members · 5 expenses</span><span>Settled up</span></div></div></div>
</div>`,
`  <div class="gcard"><div class="top" style="background:var(--yellow)"><span class="avatar avatar-lg" style="background:#fff">🎉</span></div><div class="body"><div style="display:flex;justify-content:space-between;align-items:center"><b>Birthday Party</b><b>$320</b></div><div class="meta"><span>8 members · 5 expenses</span><span>Settled up</span></div></div></div>
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
</div>`);

fs.writeFileSync('docs/gen-web.cjs', src, 'utf8');
console.log('polish applied');
