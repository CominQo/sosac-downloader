(function () {
  "use strict";
  var C = window.SOSAC_CONFIG || {};
  var $ = function (s) { return document.querySelector(s); };
  var configured = C.SUPABASE_URL && C.SUPABASE_URL.indexOf("TVOJ-") === -1;
  var sb = configured ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
  var state = { user: null, owned: false, release: null };

  $("#yr").textContent = new Date().getFullYear();

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(t) { var e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(function () { e.classList.remove("on"); }, 3200); }
  function openModal(html) { $("#modal").innerHTML = html; $("#ov").classList.add("on"); }
  function closeModal() { $("#ov").classList.remove("on"); }
  $("#ov").addEventListener("click", function (e) { if (e.target.id === "ov") closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  var ICON_DL = '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>';

  /* ---------- data ---------- */
  async function loadState() {
    state.user = null; state.owned = false; state.release = null;
    if (!sb) return render();
    var s = await sb.auth.getSession();
    state.user = s.data.session ? s.data.session.user : null;
    if (state.user) {
      var p = await sb.from("purchases").select("id").eq("user_id", state.user.id).eq("status", "paid").limit(1);
      state.owned = !!(p.data && p.data.length);
      if (state.owned) {
        var r = await sb.from("releases").select("*").order("created_at", { ascending: false }).limit(1);
        state.release = r.data && r.data[0] || null;
      }
    }
    render();
  }

  /* ---------- UI ---------- */
  function render() {
    var nav = $("#navAcc");
    nav.textContent = state.user ? "Môj účet" : "Prihlásiť sa";
    var buy = $("#buyBtn");
    if (state.owned) { buy.textContent = "Už vlastníš Sosáča ✓"; buy.disabled = true; }
    else { buy.textContent = "Kúpiť za 10 €"; buy.disabled = false; }
    $("#heroDl").textContent = state.owned ? "Stiahnuť" : "Stiahnuť (po kúpe)";
    renderDownload();
  }

  function renderDownload() {
    var el = $("#dlCard");
    if (!sb) { el.innerHTML = '<div class="lock">⚙️ Stránka ešte nie je prepojená so Supabase. Vyplň <b>config.js</b> podľa SETUP.md.</div>'; return; }
    if (!state.user) {
      el.innerHTML = '<h3>Stiahnutie je zamknuté 🔒</h3><p>Prihlás sa účtom, s ktorým si kúpil Sosáča.</p>' +
        '<div class="row"><button class="btn pri" data-act="login">Prihlásiť sa</button><button class="btn ghost" data-act="buy">Ešte nemám, kúpim</button></div>';
    } else if (!state.owned) {
      el.innerHTML = '<h3>Ahoj 👋</h3><p>Účet <b>' + esc(state.user.email) + '</b> zatiaľ nemá kúpenú licenciu.</p>' +
        '<div class="lock">Platba ide cez Stripe a licencia sa pripíše automaticky, zvyčajne do pár sekúnd. Ak si práve zaplatil, <a href="#" data-act="refresh"><b>obnov stav</b></a>.</div>' +
        '<div class="row"><button class="btn pink" data-act="buy">Kúpiť za 10 €</button></div>';
    } else if (state.release) {
      var r = state.release;
      el.innerHTML = '<span class="tag ok">Kúpené ✓</span><h3 style="margin-top:10px">Sosáč ' + esc(r.version) + '</h3>' +
        '<p>Najnovšia verzia pre Windows' + (r.size_mb ? ' · ' + esc(r.size_mb) + ' MB' : '') + '</p>' +
        '<div class="row"><button class="btn lg ok" data-act="download">' + ICON_DL + ' Stiahnuť Sosáča</button></div>' +
        (r.notes ? '<div class="notes"><b>Čo je nové:</b>\n' + esc(r.notes) + '</div>' : '') +
        '<div class="msg" id="dlMsg"></div>';
    } else {
      el.innerHTML = '<span class="tag ok">Kúpené ✓</span><h3 style="margin-top:10px">Zatiaľ nie je nahraná žiadna verzia</h3><p>Pozri sa sem o chvíľu.</p>';
    }
  }

  function authModal(mode) {
    mode = mode || "login";
    var reg = mode === "register";
    openModal('<button class="x" data-act="close" aria-label="Zavrieť">✕</button>' +
      '<h3>' + (reg ? 'Vytvor účet' : 'Prihlásenie') + '</h3>' +
      '<p class="sub">' + (reg ? 'Účet potrebuješ na nákup, podľa neho Sosáč pozná zákazníka.' : 'Vitaj späť. Prihlás sa a stiahni Sosáča.') + '</p>' +
      '<div class="tabs"><button data-act="tab-login" class="' + (reg ? '' : 'on') + '">Prihlásiť</button><button data-act="tab-reg" class="' + (reg ? 'on' : '') + '">Registrovať</button></div>' +
      '<label for="em">E-mail</label><input id="em" type="email" autocomplete="email" placeholder="ty@priklad.sk">' +
      '<label for="pw">Heslo</label><input id="pw" type="password" autocomplete="' + (reg ? 'new-password' : 'current-password') + '" placeholder="aspoň 8 znakov">' +
      '<div class="stack"><button class="btn pri" data-act="' + (reg ? 'do-reg' : 'do-login') + '">' + (reg ? 'Vytvoriť účet' : 'Prihlásiť sa') + '</button>' +
      (reg ? '' : '<button class="btn sm ghost" data-act="forgot">Zabudnuté heslo</button>') + '</div>' +
      '<div class="msg" id="aMsg"></div>');
    setTimeout(function () { var e = $("#em"); if (e) e.focus(); }, 50);
    $("#pw").addEventListener("keydown", function (e) { if (e.key === "Enter") act(reg ? "do-reg" : "do-login"); });
  }

  function profileModal() {
    var u = state.user;
    openModal('<button class="x" data-act="close" aria-label="Zavrieť">✕</button><div class="profile"><h3>Môj účet</h3>' +
      '<div class="who"><div class="avatar">' + esc((u.email || "?")[0].toUpperCase()) + '</div><div><div class="em">' + esc(u.email) + '</div>' +
      '<span class="tag ' + (state.owned ? 'ok' : '') + '">' + (state.owned ? 'Plná verzia ✓' : 'Bez licencie') + '</span></div></div>' +
      '<div class="stack">' + (state.owned ? '<a class="btn ok" href="#stiahnut" data-act="close">Prejsť na stiahnutie</a>' : '<button class="btn pink" data-act="buy">Kúpiť za 10 €</button>') +
      '<button class="btn ghost" data-act="logout">Odhlásiť sa</button></div></div>');
  }

  function aMsg(t, good) { var m = $("#aMsg"); if (m) { m.textContent = t || ""; m.className = "msg " + (good ? "good" : "err"); } }

  /* ---------- actions ---------- */
  async function act(a) {
    if (!sb && a !== "close") { toast("Najprv vyplň config.js (pozri SETUP.md)"); return; }
    switch (a) {
      case "close": closeModal(); break;
      case "login": case "tab-login": authModal("login"); break;
      case "tab-reg": authModal("register"); break;
      case "do-login": {
        aMsg("Prihlasujem…", true);
        var r = await sb.auth.signInWithPassword({ email: $("#em").value.trim(), password: $("#pw").value });
        if (r.error) return aMsg(r.error.message === "Invalid login credentials" ? "Zlý e-mail alebo heslo." : r.error.message);
        closeModal(); toast("Vitaj späť! 👋"); await loadState(); break;
      }
      case "do-reg": {
        var pw = $("#pw").value; if (pw.length < 8) return aMsg("Heslo musí mať aspoň 8 znakov.");
        aMsg("Vytváram účet…", true);
        var g = await sb.auth.signUp({ email: $("#em").value.trim(), password: pw, options: { emailRedirectTo: location.origin + location.pathname } });
        if (g.error) return aMsg(g.error.message);
        if (g.data.session) { closeModal(); toast("Účet vytvorený 🎉"); await loadState(); }
        else aMsg("Poslali sme ti potvrdzovací e-mail. Potvrď ho a prihlás sa.", true);
        break;
      }
      case "forgot": {
        var em = $("#em").value.trim(); if (!em) return aMsg("Napíš e-mail hore.");
        var f = await sb.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname });
        aMsg(f.error ? f.error.message : "Poslali sme odkaz na obnovu hesla.", !f.error); break;
      }
      case "logout": await sb.auth.signOut(); closeModal(); toast("Odhlásený"); await loadState(); break;
      case "refresh": await loadState(); toast(state.owned ? "Licencia nájdená ✓" : "Zatiaľ nič, skús o chvíľu"); break;
      case "buy": return buy();
      case "download": return download();
    }
  }

  function buy() {
    if (state.owned) return toast("Sosáča už máš kúpeného ✓");
    if (!state.user) { authModal("register"); var m = $("#aMsg"); if (m) aMsg("Najprv si vytvor účet, potom ťa pošleme na platbu.", true); return; }
    var url = new URL(C.CHECKOUT_URL);
    url.searchParams.set("client_reference_id", state.user.id);
    url.searchParams.set("prefilled_email", state.user.email);
    location.href = url.toString();
  }

  async function download() {
    var r = state.release, m = $("#dlMsg");
    if (!r) return;
    m.textContent = "Pripravujem odkaz…"; m.className = "msg good";
    var s = await sb.storage.from(C.RELEASES_BUCKET).createSignedUrl(r.file_path, 120, { download: r.file_name || true });
    if (s.error) { m.textContent = "Sťahovanie zlyhalo: " + s.error.message; m.className = "msg err"; return; }
    m.textContent = "Sťahovanie začalo ✓";
    location.href = s.data.signedUrl;
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act]");
    if (t) { var a = t.getAttribute("data-act"); if (t.tagName === "A" && a !== "close") e.preventDefault(); act(a); }
  });
  $("#navAcc").addEventListener("click", function () { if (!sb) return toast("Najprv vyplň config.js (pozri SETUP.md)"); state.user ? profileModal() : authModal("login"); });
  $("#buyBtn").addEventListener("click", buy);

  if (sb) sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY") recovery(); });
  function recovery() {
    openModal('<h3>Nové heslo</h3><p class="sub">Zadaj si nové heslo.</p><label for="np">Heslo</label><input id="np" type="password" autocomplete="new-password"><div class="stack"><button class="btn pri" id="npb">Uložiť</button></div><div class="msg" id="aMsg"></div>');
    $("#npb").onclick = async function () {
      var v = $("#np").value; if (v.length < 8) return aMsg("Aspoň 8 znakov.");
      var r = await sb.auth.updateUser({ password: v }); if (r.error) return aMsg(r.error.message);
      closeModal(); toast("Heslo zmenené ✓"); loadState();
    };
  }

  // návrat z platby: pár sekúnd čakáme na webhook
  var paid = /[?&]paid=1/.test(location.search);
  loadState().then(async function () {
    if (paid && state.user && !state.owned) {
      toast("Platba prijatá, overujem licenciu…");
      for (var i = 0; i < 10 && !state.owned; i++) { await new Promise(function (r) { setTimeout(r, 2000); }); await loadState(); }
      if (state.owned) { toast("Hotovo, môžeš sťahovať 🎉"); location.hash = "stiahnut"; }
    }
  });
})();
