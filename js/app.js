/* ------------------------------------------------------------
   Vishing Challenge — im Format der Phishing Challenge 2.0
   Start (Titel, Welle, fliegende Symbole) → „Bereit für Level 1?“ → Intro
   ohne Stimme (Stimmklon-Werkbank) → Level 1 (3 Anrufe) → Level-Auswertung
   → Sicherheitstipp (Vishing-Nugget, Frage am Ende) → Level 2 (3 Anrufe)
   → Level-Auswertung → Auswertung. Punkte = die Beute des Hackers (je weniger, desto besser);
   ein Klick auf die Beute oben holt den Hacker herein.
   Jeder Anruf: Lage → Stille → Klingeln → Gespräch (zwei
   Wahlrunden) → Urteil im Panel → Feedback im Panel wie in der Phishing Challenge
   (Ergebnis + das Entscheidende, dann auf Wunsch die Signale einzeln, zum Schluss „Das schützt dich“).
   Sprünge zum Testen: #intro, #l1, #l2, #anruf1 … #anruf6, #e1, #e2, #pause, #frage, #ende
   ------------------------------------------------------------ */
(function () {
  const C = window.CONTENT;
  const K = window.Klang;
  const $ = id => document.getElementById(id);
  const app = $('app');
  const ohneTags = t => t.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
  const euro = n => n.toLocaleString('de-DE') + ' €';
  const warte = ms => new Promise(r => setTimeout(r, ms));
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const S = {
    i: 0, level: 0, ergebnisse: [], beute: 0, pause: null, pauseFertig: false,
    cc: false, lauf: null, epoche: 0, karte: 0, introGesehen: false
  };
  const f = (t, w) => String(t).replace(/\{(\w+)\}/g, (m, k) => (w && k in w ? w[k] : m));

  /* ================= Level ================= */
  const LV = C.levels;
  const lvStart = l => LV.slice(0, l).reduce((n, x) => n + x.anzahl, 0);
  const levelVon = i => { let n = 0; for (let l = 0; l < LV.length; l++) { n += LV[l].anzahl; if (i < n) return l; } return LV.length - 1; };
  const istRichtig = e => !!(e && e.richtig && !e.zuSpaet);

  /* ================= Bildschirme ================= */
  function zeige(id) {
    document.querySelectorAll('.screen').forEach(s => {
      const an = s.id === id;
      if (an && s.hidden) { s.classList.remove('rein'); void s.offsetWidth; s.classList.add('rein'); }
      s.hidden = !an;
      if (an) s.scrollTop = 0;
    });
    app.dataset.screen = id;
    hudSichtbar();
  }

  const ICONS = {
    'phone-off': '<path d="M3.5 13.6c4.7-4.1 12.3-4.1 17 0l-1.8 2.5c-.4.5-1.1.6-1.6.3l-2.2-1.3c-.4-.2-.6-.7-.5-1.1l.3-1.6a10.6 10.6 0 0 0-5.4 0l.3 1.6c.1.4-.1.9-.5 1.1l-2.2 1.3c-.5.3-1.2.2-1.6-.3z"/>',
    'phone-out': '<path d="M6.6 3.2 8.8 5c.4.3.5.9.3 1.4L8 8.8a12 12 0 0 0 7.2 7.2l2.4-1.1c.5-.2 1-.1 1.4.3l1.8 2.2c.4.5.3 1.2-.2 1.6l-1.6 1.3c-.9.7-2.1.9-3.1.5A18.4 18.4 0 0 1 3.2 8.2c-.4-1-.2-2.2.5-3.1L5 3.4c.4-.5 1.1-.6 1.6-.2z"/><path d="M15 3h6v6M21 3l-6 6"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.8-8.8M17 6l2.5 2.5M14.5 8.5 16.5 10.5"/>',
    frage: '<path d="M4 5h16v11H9l-5 4z"/><path d="M10 9a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.4M12 13.8h.01"/>',
    kamera: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    rueckruf: '<path d="M6.6 3.2 8.8 5c.4.3.5.9.3 1.4L8 8.8a12 12 0 0 0 7.2 7.2l2.4-1.1c.5-.2 1-.1 1.4.3l1.8 2.2c.4.5.3 1.2-.2 1.6l-1.6 1.3c-.9.7-2.1.9-3.1.5A18.4 18.4 0 0 1 3.2 8.2c-.4-1-.2-2.2.5-3.1L5 3.4c.4-.5 1.1-.6 1.6-.2z"/><path d="M15 3h6v6M21 3l-6 6"/>',
    display: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M9 7h6M9 10.5h4M11 18h2"/>',
    welle: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
    warnung: '<path d="M12 4 21.5 20h-19z"/><path d="M12 10v4.5M12 17.2v.01"/>'
  };
  const icon = (n, cls) => `<svg class="ico ${cls || ''}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;
  const HOERER = 'M6.6 3.2 8.8 5c.4.3.5.9.3 1.4L8 8.8a12 12 0 0 0 7.2 7.2l2.4-1.1c.5-.2 1-.1 1.4.3l1.8 2.2c.4.5.3 1.2-.2 1.6l-1.6 1.3c-.9.7-2.1.9-3.1.5A18.4 18.4 0 0 1 3.2 8.2c-.4-1-.2-2.2.5-3.1L5 3.4c.4-.5 1.1-.6 1.6-.2z';
  const PFEIL = '<svg class="ico pfeil" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const NOCHMAL = '<svg class="ico" viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>';
  const HAKEN = '<svg class="ico" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const KREUZ = '<svg class="ico" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
  // Bildsymbole im Stil der Phishing Challenge (Kachel mit Verlauf, weiße Form)
  const BILD = {
    telefon: (id = 'bt') => `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F86"/><stop offset="1" stop-color="#8F2BC9"/></linearGradient></defs>
      <rect width="120" height="120" rx="30" fill="url(#${id})"/><path d="${HOERER}" transform="translate(27 29) scale(2.55)" fill="#fff"/>
      <path d="M76 30a17 17 0 0 1 14 14M77 18a29 29 0 0 1 25 25" fill="none" stroke="#17FFC0" stroke-width="6" stroke-linecap="round"/></svg>`,
    video: (id = 'bv') => `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6A86FF"/><stop offset="1" stop-color="#8F2BC9"/></linearGradient></defs>
      <rect width="120" height="120" rx="30" fill="url(#${id})"/><rect x="20" y="38" width="56" height="44" rx="10" fill="#fff"/><path d="M80 52 100 40v40L80 68Z" fill="#fff"/>
      <circle cx="33" cy="50" r="5" fill="#FF2D87"/><path d="M38 66c4-6 16-6 20 0" fill="none" stroke="#8F2BC9" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="56" r="5" fill="#8F2BC9"/></svg>`,
    welle: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2B2963" stroke="#4B47A0" stroke-width="2"/>
      <g stroke="#17FFC0" stroke-width="4.5" stroke-linecap="round"><path d="M16 28v8M24 22v20M32 16v32M40 24v16M48 29v6"/></g></svg>`,
    mikro: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#2B2963" stroke="#4B47A0" stroke-width="2"/>
      <rect x="25" y="14" width="14" height="24" rx="7" fill="#FF8278"/><path d="M19 32a13 13 0 0 0 26 0M32 45v6M25 51h14" fill="none" stroke="#FF8278" stroke-width="4" stroke-linecap="round"/></svg>`,
    warnung: `<svg viewBox="0 0 64 58" aria-hidden="true"><path d="M32 6 58 52H6Z" fill="#FFCF4A" stroke="#FFCF4A" stroke-width="8" stroke-linejoin="round"/><path d="M32 22v14M32 43v.5" stroke="#3B2B00" stroke-width="6" stroke-linecap="round"/></svg>`
  };
  const chipHoerer = `<svg class="ico" viewBox="0 0 24 24"><path d="${HOERER}"/></svg>`;

  // Start: Flug durch den Raum wie in der Phishing Challenge – Symbole tauchen klein rund um den Text auf
  // und gleiten langsam nach außen, dazu ein paar Sterne für die Tiefe.
  function sternenflug() {
    const teile = [
      [BILD.telefon('sft'), -1, -.32], [BILD.welle, 1, -.42], [BILD.warnung, -.92, .5],
      [BILD.video('sfv'), .95, .38], [`<img class="flieg-gesicht" src="${C.intro.foto}" alt="">`, -.45, -1], [BILD.mikro, .5, -1],
      [`<span class="sw-chip">${chipHoerer}+49 157 3308 1146</span>`, 1, .02], [`<span class="sw-chip mint"><i class="rec-dot"></i>REC 00:03</span>`, -1, .08]
    ];
    const dauer = 15, n = teile.length;
    const symbole = teile.map(([h, x, y], i) => {
      const l = Math.hypot(x, y);
      return `<div class="flieg" style="--dx:${(x / l).toFixed(3)};--dy:${(y / l).toFixed(3)};--t:${dauer}s;--d:${(-i * dauer / n - 1).toFixed(2)}s;--r0:${((i % 2 ? 1 : -1) * 8)}deg">${h}</div>`;
    }).join('');
    let sterne = '';
    for (let i = 0; i < 22; i++) {
      const w = (i / 22) * Math.PI * 2 + Math.random() * .25;
      sterne += `<i class="stern" style="--dx:${Math.cos(w).toFixed(3)};--dy:${(Math.sin(w) * .8).toFixed(3)};--t:${(6 + Math.random() * 4).toFixed(1)}s;--d:${(-Math.random() * 10).toFixed(1)}s"></i>`;
    }
    return sterne + symbole;
  }

  // Halbkreis-Messer wie in der Phishing Challenge (ohne Bestehensgrenze, wenn grenze fehlt)
  function messer(p, mitte, grenze, label) {
    const R = 96, U = 2 * Math.PI * R, L = U * 0.75;
    let marke = '', lab = '';
    if (grenze != null) {
      const th = (135 + 270 * grenze) * Math.PI / 180, cos = Math.cos(th), sin = Math.sin(th);
      const mx = 120 + R * cos, my = 120 + R * sin, ax = 120 + (R + 16) * cos, ay = 120 + (R + 16) * sin;
      const lx = (120 + (R + 20) * cos) / 2.4, ly = (120 + (R + 20) * sin) / 2.4;
      marke = `<g class="m-marke"><line x1="${mx}" y1="${my}" x2="${ax}" y2="${ay}"/><circle cx="${mx}" cy="${my}" r="5"/></g>`;
      lab = `<div class="m-label" style="left:${lx}%;top:${ly}%;${cos < 0 ? 'transform:translate(calc(-100% - 10px),-100%);align-items:flex-end;' : ''}">${esc(label)}<b>${Math.round(grenze * 100)} %</b></div>`;
    }
    return `<div class="messer" data-p="${p}" data-l="${L}">
      <svg viewBox="0 0 240 240"><defs><linearGradient id="messerVerlauf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0FE3A8"/><stop offset="1" stop-color="#5CFFD8"/></linearGradient></defs>
        <circle class="m-spur" cx="120" cy="120" r="${R}" stroke-dasharray="${L} ${U}" transform="rotate(135 120 120)"/>
        <circle class="m-wert" cx="120" cy="120" r="${R}" stroke-dasharray="${L} ${U}" style="stroke-dashoffset:${L}" transform="rotate(135 120 120)"/>${marke}</svg>
      <div class="m-mitte">${mitte}</div>${lab}</div>`;
  }
  function messerStarten(el) {
    const ms = el.querySelector('.messer'), wert = el.querySelector('.m-wert'), zahl = el.querySelector('.m-prozent');
    if (!ms) return;
    const p = +ms.dataset.p, L = +ms.dataset.l;
    setTimeout(() => { wert.style.strokeDashoffset = L * (1 - p); }, reduziert ? 0 : 350);
    (async () => {
      await warte(reduziert ? 0 : 400);
      const schritte = 26;
      for (let i = 1; i <= schritte && !reduziert; i++) { if (!el.isConnected || el.closest('[hidden]')) return; zahl.textContent = Math.round(p * 100 * i / schritte) + ' %'; await warte(1300 / schritte); }
      zahl.textContent = Math.round(p * 100) + ' %';
    })();
  }
  function punkte(aktiv) {
    return `<div class="punkte">${LV.map((l, i) => `<i class="${i === aktiv ? 'an' : i < aktiv ? 'fertig' : ''}"></i>`).join('')}</div>`;
  }
  // Ein Bildschirm-Container scrollt selbst (nie scrollIntoView – das verschiebt in einem LMS die ganze Seite)
  function scrollZu(container, el) {
    if (!container || !el) return;
    const c = container.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.bottom > c.bottom - 12) container.scrollTo({ top: container.scrollTop + r.bottom - c.bottom + 24, behavior: reduziert ? 'auto' : 'smooth' });
  }
  const konfetti = (menge, farben) => window.Feier && Feier.konfetti(menge, farben);

  // gemischter Beutel: jede Zeile kommt einmal dran, dann wird neu gemischt (nie zweimal hintereinander dieselbe)
  const beutel = {};
  function ausBeutel(name, liste) {
    let b = beutel[name];
    if (!b || !b.rest.length) {
      const neu = liste.slice().sort(() => Math.random() - .5);
      if (b && neu.length > 1 && neu[0] === b.zuletzt) neu.push(neu.shift());
      b = beutel[name] = { rest: neu, zuletzt: b && b.zuletzt };
    }
    b.zuletzt = b.rest.shift();
    return b.zuletzt;
  }

  // Hacker wie in der Phishing Challenge: fliegt schräg von links herein und sagt etwas.
  // freut = hat gewonnen (zwinkert, lacht), aergert = durchschaut (große Augen, Schweiß), gaehnt = langweilt sich
  const hacker = (() => {
    const el = $('hacker'), blase = $('hacker-blase');
    let t = 0, t2 = 0;
    return {
      zeige(stimmung, text) {
        clearTimeout(t); clearTimeout(t2);
        blase.textContent = text;
        el.className = 'hacker ' + stimmung;
        void el.offsetWidth;
        el.classList.add('da');
        K.fx.whoosh();
        t2 = setTimeout(() => ({ freut: K.fx.hackerHaha, aergert: K.fx.hackerGrr, gaehnt: K.fx.hackerGaehn }[stimmung])(), 650);
        t = setTimeout(() => el.classList.remove('da'), Math.min(6500, 2600 + text.length * 40));   // lange Sätze bleiben länger
      },
      weg() { clearTimeout(t); clearTimeout(t2); el.classList.remove('da'); }
    };
  })();

  // Text Zeichen für Zeichen schreiben (Hacker-Sprechblase, Werkbank-Kopf)
  function tippe(el, text, tempo, ton) {
    el.textContent = '';
    const tok = {}; el._tipp = tok;
    let i = 0;
    return new Promise(ok => {
      (function weiter() {
        if (el._tipp !== tok) return ok();
        i++; el.textContent = text.slice(0, i);
        if (ton && i % 2 === 0 && text[i - 1] !== ' ') K.fx.tippen();
        if (i >= text.length || reduziert) { el.textContent = text; return ok(); }
        setTimeout(weiter, tempo || 22);
      })();
    });
  }

  // Zahl hochzählen
  function zaehle(el, bis, format, dauer) {
    const t0 = performance.now(); dauer = dauer || 1100;
    (function schritt(t) {
      const f = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - f, 3);
      el.textContent = format(Math.round(bis * e));
      if (f < 1) requestAnimationFrame(schritt);
    })(t0);
  }

  /* ================= Welle (Start) ================= */
  function welle(canvas, quelle) {
    const g = canvas.getContext('2d');
    let w = 0, h = 0, t = 0;
    function groesse() {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      canvas.width = w * d; canvas.height = h * d; g.setTransform(d, 0, 0, d, 0, 0);
    }
    groesse(); addEventListener('resize', groesse);
    const kurve = x => Math.sin(x * 0.045 + t * 3) * 0.6 + Math.sin(x * 0.11 - t * 4.3) * 0.3 + Math.sin(x * 0.019 + t) * 0.4;
    (function rahmen() {
      if (!canvas.offsetParent) { requestAnimationFrame(rahmen); return; }
      t += reduziert ? 0.004 : 0.016;
      const p = quelle ? quelle() : 0.35 + 0.25 * Math.sin(t * 0.7);
      g.clearRect(0, 0, w, h);
      const mitte = h / 2, n = Math.floor(w / 3), naht = w / 2 + Math.sin(t * 0.9) * w * 0.03;
      g.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = i / n * w; if (x > naht) break;
        const y = mitte + Math.sin(Math.PI * x / w) * h * 0.38 * p * kurve(x);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.strokeStyle = '#35F0C0'; g.lineWidth = 2.2; g.shadowColor = 'rgba(53,240,192,.6)'; g.shadowBlur = 12; g.stroke();
      g.beginPath();
      const stufe = 9; let erst = true;
      for (let x = Math.floor(naht / stufe) * stufe; x <= w; x += stufe) {
        const xx = Math.max(x, naht);
        const y = Math.round((mitte + Math.sin(Math.PI * xx / w) * h * 0.38 * p * kurve(xx)) / 6) * 6;
        if (erst) { g.moveTo(xx, y); erst = false; } else g.lineTo(xx, y);
        g.lineTo(Math.min(w, x + stufe), y);
      }
      g.strokeStyle = '#FF2D87'; g.shadowColor = 'rgba(255,45,135,.6)'; g.stroke();
      g.shadowBlur = 0; g.fillStyle = 'rgba(246,244,255,.45)';
      for (let y = 6; y < h - 6; y += 7) if (Math.random() > 0.25) g.fillRect(naht - 0.75, y, 1.5, 3.5);
      requestAnimationFrame(rahmen);
    })();
  }

  /* ================= Start ================= */
  function startAufbauen() {
    $('hud-titel').textContent = C.hud.titel;
    $('hud-beute-label').textContent = C.hud.beute;
    $('start-titel').innerHTML = C.start.titel.split(' ').map(w => `<span class="${w === C.start.akzent ? 'wort-ki' : ''}">${esc(w)}</span>`).join(' ');
    $('start-los').innerHTML = esc(C.start.knopf) + ' ' + PFEIL;
    $('start-kern').textContent = C.start.kern;
    $('start-fakten').innerHTML = C.start.fakten.map(x => `<li>${esc(x)}</li>`).join('');
    $('sternenflug').innerHTML = sternenflug();
    welle($('start-welle'));
    $('start-los').addEventListener('click', () => {
      K.init(); K.fx.klick();
      vorladen(C.anrufe[0]);
      neuesSpiel();
      levelIntro(0);
    });
  }

  /* ================= Intro (nach „Bereit für Level 1?“, endet mit „Gleich klingelt dein Telefon.“) ================= */
  let introAbbruch = false;

  async function intro() {
    zeige('s-intro');
    introAbbruch = false;
    const ep = ++S.epoche;
    const ok = () => !introAbbruch && ep === S.epoche;
    K.musik('intro', 0.55, 1.2);
    $('intro-skip').textContent = C.intro.skip;
    tippe($('kit-kopf').querySelector('span'), C.intro.kopf, 40);
    await warte(700);
    for (const b of C.intro.beats) {
      if (!ok()) return;
      await beatZeigen(b, ok);
    }
    if (ok()) introFertig();
  }
  // nach dem Intro klingelt sofort der erste Anruf – in Stille; beim Neustart kommt das Intro nicht noch einmal
  function introFertig() {
    S.introGesehen = true;
    hudAufbauen();
    anrufStarten(lvStart(0), { still: true });
  }

  async function beatZeigen(b, ok) {
    const beat = $('beat'), gross = $('beat-gross'), klein = $('beat-klein'), erg = $('beat-ergebnis');
    beat.classList.remove('rein'); beat.classList.add('raus');
    await warte(180);
    beat.dataset.art = b.art;
    erg.textContent = ''; erg.classList.remove('an');
    klein.textContent = b.klein || '';
    if (b.art === 'frage') gross.innerHTML = '<span class="mega-a">Echt</span> <span class="mega-oder">oder</span> <span class="mega-b">Fake?</span>';
    else gross.textContent = b.gross;
    beat.classList.remove('raus'); void beat.offsetWidth; beat.classList.add('rein');

    if (b.art === 'ring') {
      K.musikAus(2.6);   // danach ist es still, bis das Telefon klingelt
      await warte(2600);
      beat.classList.remove('rein'); beat.classList.add('raus');
      await warte(900);
      return;
    }
    K.fx.schlag();
    if (b.art === 'audio') { await aufnahme(2800, ok); await ergebnis(b, ok); await warte(650); }
    else if (b.art === 'frage') { gross.classList.add('flackern'); await warte(900); gross.classList.remove('flackern'); await warte(1500); }
    else await warte(2300);
  }
  async function ergebnis(b, ok) {
    if (!ok()) return;
    const erg = $('beat-ergebnis');
    erg.textContent = '✓ ' + b.ergebnis; erg.classList.add('an');
    K.fx.fertig();
    await warte(500);
  }

  // Werkbank 1: eine Aufnahme läuft drei Sekunden
  function aufnahme(dauer, ok) {
    const cv = $('rec-welle'), g = cv.getContext('2d'), zeit = $('rec-zeit');
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    cv.width = r.width * d; cv.height = r.height * d; g.setTransform(d, 0, 0, d, 0, 0);
    const W = r.width, H = r.height, balken = [];
    let pegel = 0, letzterPiep = 0;
    const t0 = performance.now();
    return new Promise(fertig => {
      (function schritt(t) {
        const f = Math.min(1, (t - t0) / dauer);
        zeit.textContent = '00:0' + (f * 3).toFixed(1);
        // sprachartige Hüllkurve: Silben mit kleinen Pausen
        const silbe = Math.sin(t / 95) * 0.5 + 0.5, pause = Math.sin(t / 610) > -0.55 ? 1 : 0.12;
        pegel += ((0.25 + Math.random() * 0.75) * silbe * pause - pegel) * 0.35;
        balken.push(pegel);
        const n = Math.floor(W / 5); while (balken.length > n) balken.shift();
        g.clearRect(0, 0, W, H);
        balken.forEach((v, i) => {
          const hh = Math.max(2, v * H * 0.9), x = W - (balken.length - i) * 5;
          g.fillStyle = i > balken.length - 4 ? '#FF2D87' : 'rgba(255,45,135,.55)';
          g.fillRect(x, (H - hh) / 2, 3, hh);
        });
        if (t - letzterPiep > 1000) { K.fx.rec(); letzterPiep = t; }
        if (f < 1 && ok()) requestAnimationFrame(schritt); else fertig();
      })(t0);
    });
  }

  $('intro-skip').addEventListener('click', () => {
    if (app.dataset.screen !== 's-intro') return;
    introAbbruch = true; K.fx.klick(); K.musikAus(0.8);
    introFertig();
  });

  /* ================= Spiel ================= */
  function neuesSpiel() {
    S.i = 0; S.level = 0; S.ergebnisse = []; S.beute = 0; S.pause = null; S.pauseFertig = false;
    $('hud-beute-wert').textContent = euro(0);
  }

  /* ================= HUD ================= */
  // Was oben rechts steht, hängt vom Bildschirm ab (wie in der Serie): im Spiel Kasse, Fortschritt und Untertitel
  function hudSichtbar() {
    const scr = app.dataset.screen;
    $('hud-beute').hidden = !['s-level', 's-spiel', 's-levelende'].includes(scr);
    $('hud-fortschritt').hidden = !['s-spiel', 's-levelende'].includes(scr);
    if (!$('hud-fortschritt').hidden) hudAktualisieren();
  }
  function hudAufbauen() {
    $('hud-beute-wert').textContent = euro(S.beute);
    hudAktualisieren();
  }
  function hudAktualisieren() {
    const l = levelVon(S.i), a0 = lvStart(l), n = LV[l].anzahl;
    $('hud-level').textContent = `${C.hud.level} ${l + 1}`;
    $('hud-anruf').textContent = `${C.hud.anruf} ${Math.min(S.i - a0 + 1, n)}/${n}`;
    const seg = $('hud-punkte');
    if (seg.children.length !== n) seg.innerHTML = '<i></i>'.repeat(n);
    [...seg.children].forEach((p, k) => {
      const e = S.ergebnisse[a0 + k];
      p.className = e ? (istRichtig(e) ? 'ja' : 'nein') : (a0 + k === S.i && app.dataset.screen === 's-spiel' ? 'jetzt' : '');
    });
  }
  function beuteZaehlen(von, bis) {
    const el = $('hud-beute-wert'), box = $('hud-beute');
    box.classList.add('steigt');
    const t0 = performance.now(), dauer = 1600; let n = 0;
    (function schritt(t) {
      const f = Math.min(1, (t - t0) / dauer), e = 1 - Math.pow(1 - f, 3);
      el.textContent = euro(Math.round(von + (bis - von) * e));
      if (n++ % 3 === 0 && f < 1) K.fx.muenze(n);
      if (f < 1) requestAnimationFrame(schritt); else setTimeout(() => box.classList.remove('steigt'), 700);
    })(t0);
  }
  // Klick auf die Beute: der Hacker fliegt herein und sagt, was er von seiner Kasse hält
  $('hud-beute').addEventListener('click', () => {
    const b = S.beute, stufe = !b ? 'leer' : b <= 1000 ? 'klein' : b <= 100000 ? 'mittel' : 'gross';
    K.fx.klick();
    hacker.zeige({ leer: 'aergert', klein: 'gaehnt', mittel: 'freut', gross: 'freut' }[stufe], f(ausBeutel('kasse-' + stufe, C.hackerKasse[stufe]), { beute: euro(b) }));
  });
  // Live-Untertitel: standardmäßig aus, der Schalter im Panel blendet sie ein und aus
  function untertitelSetzen(an) {
    S.cc = an; $('cc-schalter').setAttribute('aria-checked', an); app.classList.toggle('ohne-cc', !an);
    const log = $('cc-log'); log.scrollTop = log.scrollHeight;
  }
  $('cc-schalter').addEventListener('click', () => { untertitelSetzen(!S.cc); K.fx.klick(); });
  $('btn-ton').addEventListener('click', () => {
    K.setAn(!K.an); $('btn-ton').setAttribute('aria-pressed', K.an);
  });

  /* ================= Anruf ================= */
  const geraet = $('geraet');
  let timerStart = 0, timerId = null, ringId = null;

  function setZustand(z) { geraet.dataset.zustand = z; app.dataset.anruf = z; }

  function vorladen(a) {
    const ids = [a.start.id]; a.runden.forEach(r => r.forEach(o => ids.push(o.antwort.id)));
    ids.forEach(id => K.stimmeLaden(id));
    K.sfxLaden('ring-' + a.klingel); if (a.atmo) K.sfxLaden('atmo-' + a.atmo);
    if (a.geraet !== 'teams') K.sfxLaden('vibration');
  }

  function anrufStarten(i, opt) {
    opt = opt || {};
    const ep = ++S.epoche;
    S.i = i; S.level = levelVon(i);
    const a = C.anrufe[i];
    S.a = a;
    S.lauf = { pfad: [], zuege: [], runde: 0, aufgelegt: false, beendet: false };
    if (app.dataset.screen !== 's-spiel') zeige('s-spiel');
    hudAktualisieren();
    $('urteil').hidden = true; $('feedback').hidden = true; delete $('s-spiel').dataset.phase;
    $('wahl').hidden = true; $('cc-nochmal').hidden = true;
    $('cc-log').innerHTML = '<p class="cc-leer">Noch kein Gespräch.</p>';
    $('ablehnen-tipp').hidden = true; $('geraet-ende').hidden = true;

    // Lage
    const [tag, uhr] = a.zeit.split(', ');
    $('lage-tag').textContent = C.telefon.lage + ' · ' + tag; $('lage-zeit').textContent = uhr;
    $('lage-titel').textContent = a.storyTitel; $('lage-text').textContent = a.lage;
    const lage = $('lage'); lage.classList.remove('neu', 'zu'); void lage.offsetWidth; lage.classList.add('neu');
    $('lage-toggle').setAttribute('aria-expanded', 'true');

    // Gerät
    geraet.dataset.art = a.geraet;
    $('ph-uhr').textContent = uhr; $('ph-sperre-uhr').textContent = uhr; $('ph-sperre-datum').textContent = tag;
    const an = a.anrufer;
    const avatarHtml = an.foto ? `<img src="${an.foto}" alt="">` : `<span>${an.initialen}</span>`;
    ['ph-avatar', 'win-avatar', 'win-toast-avatar'].forEach(id => { $(id).innerHTML = avatarHtml; $(id).style.setProperty('--farbe', an.farbe); });
    $('ph-name').textContent = an.name; $('ph-zeile').textContent = an.zeile;
    $('ph-kanal').textContent = C.telefon.eingehend;
    $('ph-timer').textContent = '';
    $('win-name').textContent = an.name; $('win-zeile').textContent = an.zeile; $('win-extern').hidden = !a.extern;
    $('win-toast-name').textContent = an.name + (a.extern ? ' (Extern)' : ''); $('win-toast-zeile').textContent = a.extern ? an.zeile : 'ruft Sie an …';
    $('win-call-name').textContent = an.name + (a.extern ? ' (Extern)' : '');
    $('win-timer').textContent = '';
    setZustand('ruhe');
    posteingang(a);
    vorladen(a);
    const naechster = C.anrufe[i + 1]; if (naechster) setTimeout(() => vorladen(naechster), 3000);

    // Ton: nach dem Intro komplett still; sonst leise Musik, die vor dem Klingeln abbricht
    const verzoegerung = opt.still ? 4600 : 6200;
    if (!opt.still) {
      K.musik('intro', 0.2, 1.5);
      setTimeout(() => { if (ep === S.epoche) K.musikAus(1.4); }, verzoegerung - 1900);
    }
    setTimeout(() => { if (ep === S.epoche) klingeln(); }, verzoegerung);
  }

  /* ---------- Posteingang im Teams-Fenster ---------- */
  const SPAM = [
    ['noreply@fitbox24.shop', 'Willkommen bei FitBox24 – bitte bestätigen'],
    ['news@modeoutlet-deals.com', 'Ihr Newsletter-Abo ist aktiv'],
    ['service@reisesparer.net', 'Ihr Konto wurde erstellt'],
    ['info@gratisproben.de', 'Gratis-Probe: Jetzt Adresse bestätigen'],
    ['hello@webinar-pro.io', 'Einladung: KI im Vertrieb (morgen, 10 Uhr)'],
    ['no-reply@dealradar.shop', 'Wöchentlicher Deal-Report'],
    ['support@cloudspeicher-24.com', 'Danke für Ihre Registrierung'],
    ['team@jobportal-x.de', 'Bestätigen Sie Ihre E-Mail-Adresse'],
    ['mail@gewinnspiel-heute.com', 'Anmeldung erfolgreich – viel Glück!'],
    ['noreply@forum-tech.net', 'Ihr Aktivierungslink']
  ];
  const NORMAL = [
    ['Lena Hofmann', 'Quartalszahlen – Entwurf für morgen'],
    ['Kalender', 'Weekly Vertrieb · Do 10:00'],
    ['IT-Service', 'Wartungsfenster am Samstag']
  ];
  // Die Liste liegt unter allem anderen und nimmt keine Klicks an; neue Zeilen kommen ruhig, nicht im Takt der Bildwiederholung.
  function posteingang(a) {
    clearInterval(posteingang.id);
    const el = $('win-mails'), neuEl = $('win-mails-neu'), liste = $('win-mail-liste');
    const zeile = ([von, betreff], neu) => {
      const li = document.createElement('li'); if (neu) li.className = 'neu';
      li.innerHTML = `<b>${esc(von)}</b><span>${esc(betreff)}</span>`;
      liste.prepend(li);
      while (liste.children.length > 6) liste.lastChild.remove();
    };
    liste.innerHTML = ''; neuEl.textContent = '';
    if (a.id === 'c3') {
      let n = 214, neu = 0; el.textContent = n;
      for (let i = 0; i < 6; i++) zeile(SPAM[i % SPAM.length]);
      posteingang.id = setInterval(() => {
        const plus = 2 + Math.floor(Math.random() * 4);
        n += plus; neu += plus; el.textContent = n; neuEl.textContent = '+' + neu + ' neu';
        zeile(SPAM[Math.floor(Math.random() * SPAM.length)], true);
      }, 750);
    } else {
      const mails = a.posteingang || NORMAL;
      el.textContent = String(mails.length);
      mails.slice().reverse().forEach(m => zeile(m));
    }
  }

  function klingeln() {
    const a = S.a;
    setZustand('ring');
    K.musikAus(0.2);
    K.ring(a.klingel, a.geraet !== 'teams');
    cancelAnimationFrame(ringId);
    ringId = requestAnimationFrame(ringZeichnen);
    (a.geraet === 'teams' ? $('win-annehmen') : $('ph-annehmen')).focus({ preventScroll: true });
  }

  function annehmen() {
    if (geraet.dataset.zustand !== 'ring') return;
    const a = S.a, ep = S.epoche;
    clearInterval(posteingang.id);
    K.ringStop(); K.fx.verbinden();
    setZustand('talk');
    $('ablehnen-tipp').hidden = true;
    $('cc-log').innerHTML = '';
    // Beim Klingeln bleibt die Lage offen (zum Fertiglesen); erst beim Abheben klappt sie ein – dort, wo sie über dem Gerät steht
    if (innerWidth < 960) { $('lage').classList.add('zu'); $('lage-toggle').setAttribute('aria-expanded', 'false'); }
    timerStart = performance.now();
    clearInterval(timerId);
    timerId = setInterval(() => {
      const s = Math.floor((performance.now() - timerStart) / 1000);
      const t = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
      $('ph-timer').textContent = t; $('win-timer').textContent = t;
    }, 250);
    K.atmo(a.atmo, a.klang);
    setTimeout(() => { if (ep === S.epoche) sprechen(a.start, nachZeile); }, 650);
  }
  function ablehnen() {
    if (geraet.dataset.zustand !== 'ring') return;
    K.fx.falsch();
    const t = $('ablehnen-tipp'); t.textContent = C.telefon.ablehnenTipp; t.hidden = false;
    geraet.classList.remove('wackeln'); void geraet.offsetWidth; geraet.classList.add('wackeln');
  }
  $('ph-annehmen').addEventListener('click', annehmen);
  $('win-annehmen').addEventListener('click', annehmen);
  $('ph-ablehnen').addEventListener('click', ablehnen);
  $('win-ablehnen').addEventListener('click', ablehnen);
  $('ph-auflegen').addEventListener('click', () => beenden('aufgelegt'));
  $('win-auflegen').addEventListener('click', () => beenden('aufgelegt'));

  /* ---------- Untertitel ---------- */
  let ccZeile = null, ccWoerter = [], ccRaf = null, ccQuelle = null;
  function ccNeu(wer, text, art) {
    const log = $('cc-log');
    const d = document.createElement('div');
    d.className = 'cc-zeile cc-' + art;
    d.innerHTML = `<span class="cc-wer">${esc(wer)}</span><p>${text.split(' ').map(w => `<span>${esc(w)}</span>`).join(' ')}</p>`;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function ccStart(el, quelle) {
    ccZeile = el; ccWoerter = [...el.querySelectorAll('p span')]; ccQuelle = quelle;
    // Startpunkt jedes Wortes als Anteil an allen Buchstaben (Satzzeichen zählen als kurze Pause)
    const gewicht = ccWoerter.map(w => w.textContent.replace(/[^\p{L}\p{N}]/gu, '').length + (/[.!?…]$/.test(w.textContent) ? 3 : /[,–:]$/.test(w.textContent) ? 1.5 : 0) + 1);
    const gesamt = gewicht.reduce((a, b) => a + b, 0);
    let lauf = 0; const ab = gewicht.map(g => { const v = lauf / gesamt; lauf += g; return v; });
    cancelAnimationFrame(ccRaf);
    const log = $('cc-log');
    (function schritt() {
      const f = ccQuelle ? ccQuelle() : null;
      if (f != null) {
        for (let i = 0; i < ccWoerter.length; i++) if (ab[i] <= f + 0.015 && !ccWoerter[i].classList.contains('an')) { ccWoerter[i].classList.add('an'); log.scrollTop = log.scrollHeight; }
      }
      ccRaf = requestAnimationFrame(schritt);
    })();
  }
  function ccFertig() {
    cancelAnimationFrame(ccRaf);
    if (ccZeile) ccWoerter.forEach(w => w.classList.add('an'));
    ccZeile = null; ccQuelle = null;
  }

  /* ---------- Sprechen ---------- */
  let letzte = null;
  async function sprechen(zeile, danach) {
    const a = S.a, ep = S.epoche;
    letzte = { zeile, danach };
    $('cc-nochmal').hidden = true;
    geraet.classList.add('spricht');
    const el = ccNeu(a.anrufer.name, ohneTags(zeile.tts), 'anrufer');
    const fertig = () => {
      if (ep !== S.epoche || S.lauf.beendet) return;
      geraet.classList.remove('spricht');
      ccFertig();
      // Die Leitung reißt ab (die falsche Chefin bei der Kontrollfrage)
      if (zeile.glitch) { K.fx.glitch(0.45); setTimeout(() => { if (ep === S.epoche) beenden('verbindung'); }, 900); return; }
      setTimeout(() => { if (ep === S.epoche && !S.lauf.beendet) danach(); }, 380);
    };
    await K.stimme(zeile.id, a.klang, fertig);
    if (ep !== S.epoche) { K.stimmeStop(); return; }
    ccStart(el, () => K.textFortschritt());
  }

  function nachZeile() {
    const L = S.lauf, a = S.a;
    if (L.runde >= a.runden.length) { beenden('ende'); return; }
    zeigeWahl(L.runde);
  }

  function zeigeWahl(r) {
    const a = S.a, w = $('wahl');
    $('wahl-label').textContent = C.telefon.duSagst;
    $('wahl-optionen').innerHTML = a.runden[r].map((o, i) =>
      `<button class="option" type="button" data-i="${i}" style="--i:${i}"><kbd>${i + 1}</kbd><span>${esc(o.text)}</span></button>`).join('');
    w.hidden = false;
    w.classList.remove('rein'); void w.offsetWidth; w.classList.add('rein');
    if (innerWidth < 960) setTimeout(() => scrollZu($('s-spiel'), w), 60);
    $('cc-nochmal').hidden = false;
    w.querySelectorAll('.option').forEach(b => {
      b.addEventListener('click', () => waehlen(+b.dataset.i));
      b.addEventListener('mouseenter', () => K.fx.hover());
    });
  }
  $('cc-nochmal').addEventListener('click', () => {
    if (!letzte || $('wahl').hidden) return;
    K.fx.klick(); $('wahl').hidden = true;
    sprechen(letzte.zeile, letzte.danach);
  });

  function waehlen(i) {
    const a = S.a, L = S.lauf, ep = S.epoche;
    if ($('wahl').hidden || L.beendet) return;
    const o = a.runden[L.runde][i];
    K.fx.wahl();
    L.zuege.push({ runde: L.runde, o });
    L.pfad.push(o.antwort.id);
    $('wahl').hidden = true; $('cc-nochmal').hidden = true;
    ccNeu('Du', o.text, 'du');
    L.runde++;
    setTimeout(() => { if (ep === S.epoche && !L.beendet) sprechen(o.antwort, nachZeile); }, 900);
  }

  async function beenden(grund) {
    const L = S.lauf, ep = S.epoche;
    if (!L || L.beendet) return;
    L.beendet = true;
    L.aufgelegt = grund === 'aufgelegt';
    K.stimmeStop(); K.ringStop(); K.atmoStop(); ccFertig();
    cancelAnimationFrame(ringId); clearInterval(timerId); clearInterval(posteingang.id);
    geraet.classList.remove('spricht');
    $('wahl').hidden = true; $('cc-nochmal').hidden = true;
    if (grund !== 'verbindung') K.fx.auflegen();
    const ende = $('geraet-ende');
    ende.textContent = grund === 'verbindung' ? C.telefon.verbindungWeg : C.telefon.beendet; ende.hidden = false;
    setZustand('ende');
    await warte(1500);
    if (ep === S.epoche) urteilZeigen();
  }

  /* ---------- Ring-Visual ---------- */
  function ringZeichnen() {
    const z = geraet.dataset.zustand;
    const cv = S.a.geraet === 'teams' ? $('win-ring') : $('ph-ring');
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, m = w / 2;
    g.clearRect(0, 0, w, h);
    const t = performance.now() / 1000;
    if (z === 'ring') {
      for (let k = 0; k < 3; k++) {
        const f = ((t * 0.7 + k / 3) % 1);
        g.beginPath(); g.arc(m, m, 62 + f * 90, 0, Math.PI * 2);
        g.strokeStyle = S.a.geraet === 'teams' ? `rgba(127,133,245,${0.5 * (1 - f)})` : `rgba(53,240,192,${0.5 * (1 - f)})`; g.lineWidth = 2.5; g.stroke();
      }
    } else if (z === 'talk') {
      const p = K.pegel();
      g.beginPath();
      for (let i = 0; i <= 72; i++) {
        const wnk = i / 72 * Math.PI * 2;
        const r = 70 + p * 26 * (0.7 + 0.3 * Math.sin(wnk * 3 + t * 4)) + p * 7 * Math.sin(wnk * 5 - t * 6);
        const x = m + Math.cos(wnk) * r, y = m + Math.sin(wnk) * r;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.closePath();
      const rgb = S.a.geraet === 'teams' ? '127,133,245' : '53,240,192';   // Teams-Violett bzw. Aqua
      g.strokeStyle = `rgba(${rgb},.9)`; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = `rgba(${rgb},${0.06 + p * 0.18})`; g.fill();
    }
    if (z === 'ring' || z === 'talk') ringId = requestAnimationFrame(ringZeichnen);
  }

  /* ================= Urteil ================= */
  function urteilZeigen() {
    const U = C.urteil, u = $('urteil');
    $('urteil-frage').textContent = U.frage;
    $('urteil-sub').textContent = U.sub;
    const e = $('urteil-echt'), f = $('urteil-fake');
    e.querySelector('b').textContent = U.echt.titel; e.querySelector('span').textContent = U.echt.text;
    f.querySelector('b').textContent = U.fake.titel; f.querySelector('span').textContent = U.fake.text;
    [e, f].forEach(b => b.classList.remove('gewaehlt', 'abgewaehlt'));
    u.classList.remove('entschieden');
    u.hidden = false;
    if (innerWidth < 960) setTimeout(() => scrollZu($('s-spiel'), u), 60);
    K.fx.bass();
    K.musik('intro', 0.14, 2);
  }
  $('urteil-echt').addEventListener('click', () => urteilen('echt'));
  $('urteil-fake').addEventListener('click', () => urteilen('fake'));

  function urteilen(wahl) {
    const u = $('urteil');
    if (u.hidden || u.classList.contains('entschieden')) return;
    u.classList.add('entschieden');
    const gew = wahl === 'echt' ? $('urteil-echt') : $('urteil-fake');
    const nicht = wahl === 'echt' ? $('urteil-fake') : $('urteil-echt');
    gew.classList.add('gewaehlt'); nicht.classList.add('abgewaehlt');
    K.fx.wahl();
    const a = S.a, L = S.lauf;
    const richtig = (wahl === 'echt') === a.echt;
    const zuSpaet = !a.echt && richtig && a.schadenBei && L.pfad.includes(a.schadenBei);
    const gut = L.zuege.filter(z => z.o.wert === 'gut').length;
    const beute = !a.echt && (!richtig || zuSpaet) ? a.beute : 0;
    const erg = { id: a.id, wahl, richtig, zuSpaet, beute, gut, zuege: [...L.zuege], pfad: [...L.pfad], aufgelegt: L.aufgelegt };
    S.ergebnisse[S.i] = erg;
    const alt = S.beute; S.beute += beute;
    setTimeout(() => {
      u.hidden = true;
      hudAktualisieren();
      feedbackZeigen(erg, alt);
    }, reduziert ? 0 : 520);
  }

  /* ================= Feedback im Panel (wie in der Phishing Challenge) =================
     Schritt 1: Ergebnis, allgemeine Rückmeldung, das Entscheidende – der Hacker fliegt kurz herein.
     Schritt 2 („Details anzeigen“): die Signale einzeln, zum Schluss „Das schützt dich“. */
  const H_ICON = {
    rot: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4M12 17h.01"/></svg>',
    gruen: '<svg class="ico" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    info: '<svg class="ico" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>',
    schutz: '<svg class="ico" viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m8.6 12 2.4 2.4 4.4-4.9"/></svg>'
  };
  const CHEVRON = '<svg class="ico h-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
  const schmal = () => innerWidth < 960;
  let FB = null;

  function feedbackZeigen(erg, kasseVorher) {
    const a = S.a, F = C.feedback, ep = S.epoche;
    let art;
    if (!a.echt) art = erg.zuSpaet ? 'zuSpaet' : (erg.richtig ? 'entlarvt' : 'getaeuscht');
    else art = erg.richtig ? 'echtErkannt' : 'fehlalarm';
    const gut = istRichtig(erg);
    const fb = $('feedback');
    fb.className = 'fb ' + (gut ? 'fb-ja' : 'fb-nein');
    fb.dataset.stufe = '1';
    $('fb-ikon').innerHTML = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><path d="${gut ? 'M14.5 24.5l6.5 6.5 12.5-14' : 'M17 17l14 14M31 17 17 31'}"/></svg>`;
    $('fb-titel').textContent = F[art].titel;
    $('fb-wahr').textContent = f(F[art].text, { beute: a.beuteText || '', schaden: a.schadenText || '' });
    $('fb-kern-label').textContent = F.kern;
    $('fb-kern-text').textContent = a.kern;

    // Hinweise: die Signale dieses Gesprächs (je nach Gesprächsverlauf), zum Schluss „Das schützt dich“
    const liste = a.signale.filter(s => (!s.wenn || erg.pfad.includes(s.wenn)) && (!s.wennNicht || !erg.pfad.includes(s.wennNicht)))
      .map(s => ({ art: s.art, label: F.art[s.art], titel: s.titel, text: s.text }))
      .concat({ art: 'schutz', label: F.art.schutz, titel: F.tipp, text: a.tipp });
    $('fb-liste').innerHTML = liste.map((h, i) => `<li class="h-karte h-${h.art}" style="--i:${i}">
        <button class="h-kopf" type="button" aria-expanded="false"><span class="h-nr">${H_ICON[h.art]}</span>
          <span class="h-kopf-text"><small class="h-art">${esc(h.label)}</small><b class="h-titel">${esc(h.titel)}</b></span>${CHEVRON}</button>
        <div class="h-body"><div class="h-body-innen"><p>${esc(h.text)}</p></div></div></li>`).join('');
    $('fb-dots').innerHTML = liste.map(() => '<i></i>').join('');
    $('fb-liste').querySelectorAll('.h-kopf').forEach((k, i) => k.addEventListener('click', () => { K.fx.klick(); hinweis(i); }));
    FB = { liste, i: -1, gesehen: new Set(), stufe: 1 };
    const btn = $('fb-weiter');
    btn.classList.remove('final');
    btn.innerHTML = `<span>${esc(F.details)}</span>${PFEIL}`;
    $('fb-skip').textContent = F.ueberspringen; $('fb-skip').classList.remove('weg');

    $('s-spiel').dataset.phase = 'feedback';
    fb.hidden = false; fb.scrollTop = 0; $('s-spiel').scrollTop = 0;
    fb.classList.remove('rein'); void fb.offsetWidth; fb.classList.add('rein');
    (gut ? K.fx.richtig : K.fx.falsch)();
    K.musik('intro', 0.2, 2);
    setTimeout(() => btn.focus({ preventScroll: true }), 500);
    // Kassiert der Hacker, zählt die Kasse oben mit
    if (erg.beute) setTimeout(() => { if (ep === S.epoche) beuteZaehlen(kasseVorher, S.beute); }, reduziert ? 0 : 900);
    // Der Hacker fliegt kurz herein: freut sich, wenn er gewonnen hat, ärgert sich, wenn er durchschaut wurde, gähnt bei echten Anrufen
    const h = a.hacker;
    const text = a.echt ? (erg.richtig ? h.echt : h.fehlalarm) : (gut ? h.erwischt : h.reingelegt);
    const stimmung = !gut ? 'freut' : a.echt ? 'gaehnt' : 'aergert';
    setTimeout(() => { if (ep === S.epoche && FB) hacker.zeige(stimmung, text); }, reduziert ? 0 : 700);
  }

  // Schritt 2: die Hinweise der Reihe nach
  function details() {
    const fb = FB;
    if (!fb || fb.stufe !== 1) return;
    fb.stufe = 2;
    $('feedback').dataset.stufe = '2';
    hinweis(0, true);
  }
  function hinweis(i, erster) {
    const fb = FB, F = C.feedback;
    if (!fb || fb.stufe !== 2 || i < 0 || i >= fb.liste.length) return;
    const vorher = fb.i, n = fb.liste.length;
    fb.i = i; fb.gesehen.add(i);
    const karten = [...$('fb-liste').children];
    karten.forEach((k, j) => {
      k.classList.toggle('aktiv', j === i);
      k.classList.toggle('gesehen', fb.gesehen.has(j));
      k.querySelector('.h-kopf').setAttribute('aria-expanded', j === i ? 'true' : 'false');
    });
    // schmal steht nur ein Hinweis da: der alte gleitet hinaus, der neue herein (vorwärts nach links, zurück nach rechts)
    if (schmal() && vorher >= 0 && vorher !== i && !reduziert) {
      const alt = karten[vorher], neu = karten[i], vor = i > vorher;
      alt.classList.add('geht', vor ? 'nach-links' : 'nach-rechts');
      neu.classList.add(vor ? 'von-rechts' : 'von-links');
      setTimeout(() => alt.classList.remove('geht', 'nach-links', 'nach-rechts'), 360);
      setTimeout(() => neu.classList.remove('von-rechts', 'von-links'), 420);
    }
    [...$('fb-dots').children].forEach((d, j) => { d.className = j === i ? 'jetzt' : fb.gesehen.has(j) ? 'an' : ''; });
    $('fb-zaehler').textContent = f(F.zaehler, { n: i + 1, gesamt: n });
    const letzter = i === n - 1;
    const letzterImLevel = S.i === lvStart(S.level) + LV[S.level].anzahl - 1;
    const btn = $('fb-weiter');
    btn.innerHTML = `<span>${esc(letzter ? (letzterImLevel ? F.zurLevelAuswertung : F.naechsterAnruf) : F.weiter)}</span>${PFEIL}`;
    btn.classList.toggle('final', letzter);
    $('fb-skip').classList.toggle('weg', letzter);
    // nur das Panel (bzw. schmal den Spielbildschirm) scrollen, nie scrollIntoView – sonst verschiebt sich im LMS die Seite
    setTimeout(() => {
      if (FB !== fb) return;
      const box = schmal() ? $('s-spiel') : $('feedback'), karte = karten[i];
      const b = box.getBoundingClientRect(), r = karte.getBoundingClientRect(), fuss = $('feedback').querySelector('.fb-aktionen').offsetHeight;
      const oben = r.top - b.top - 12, unten = r.bottom - (b.bottom - fuss - 8);
      const um = oben < 0 ? oben : Math.min(Math.max(0, unten), oben);
      if (Math.abs(um) > 1) box.scrollTo({ top: box.scrollTop + um, behavior: reduziert ? 'auto' : 'smooth' });
    }, reduziert ? 0 : 450);
    if (!erster) K.fx.aufdecken();
  }
  function fbWeiter() {
    const fb = FB;
    if (!fb) return;
    K.fx.klick();
    if (fb.stufe === 1) details();
    else if (fb.i < fb.liste.length - 1) hinweis(fb.i + 1);
    else weiterNachFeedback();
  }
  $('fb-weiter').addEventListener('click', fbWeiter);
  $('fb-skip').addEventListener('click', () => { if (FB) { K.fx.klick(); weiterNachFeedback(); } });
  function weiterNachFeedback() {
    if ($('feedback').hidden) return;
    FB = null;
    hacker.weg();
    $('feedback').hidden = true;
    delete $('s-spiel').dataset.phase;
    const naechster = S.i + 1;
    if (naechster >= lvStart(S.level) + LV[S.level].anzahl) levelEnde(S.level);
    else anrufStarten(naechster);
  }

  /* ================= Level-Start (wie in der Serie: „Bereit für Level X?“) ================= */
  function levelIntro(l) {
    ++S.epoche;
    S.level = l; S.i = lvStart(l);
    const lv = LV[l], LI = C.levelIntro, n = lv.anzahl, ep = S.epoche;
    zeige('s-level');
    K.musik('intro', 0.3, 1.5);
    $('lv-kicker').textContent = f(LI.kicker, { n: l + 1, gesamt: LV.length });
    const ic = $('lv-icon');
    ic.innerHTML = BILD.telefon('lvt') + '<span class="lv-zahl" id="lv-zahl">0</span>';
    $('lv-titel').textContent = f(LI.titel, { n: l + 1 });
    $('lv-unter').textContent = lv.kicker;
    $('lv-info').innerHTML = `<span>${chipHoerer}<b id="lv-n">0</b> ${esc(LI.anrufe)}</span>`;
    $('lv-los').innerHTML = esc(LI.los) + ' ' + PFEIL;
    vorladen(C.anrufe[S.i]);
    // die Anrufe des Levels fliegen in die Kachel, die Zahl zählt mit
    const zahl = $('lv-zahl'), zahl2 = $('lv-n');
    (async () => {
      await warte(reduziert ? 0 : 900);
      zahl.classList.add('da');
      for (let k = 1; k <= n; k++) {
        if (ep !== S.epoche) return;
        if (!reduziert) {
          const w = Math.random() * Math.PI * 2, fl = document.createElement('span');
          fl.className = 'flieger'; fl.style.setProperty('--fx', Math.cos(w) * 160 + 'px'); fl.style.setProperty('--fy', Math.sin(w) * 120 - 40 + 'px');
          fl.innerHTML = chipHoerer;
          ic.appendChild(fl); setTimeout(() => fl.remove(), 800);
        }
        await warte(reduziert ? 0 : 300);
        zahl.textContent = k; zahl2.textContent = k;
        zahl.classList.remove('tick'); void zahl.offsetWidth; zahl.classList.add('tick');
        K.fx.pop(k);
      }
      K.fx.fertig();
    })();
    setTimeout(() => { if (ep === S.epoche) $('lv-los').focus({ preventScroll: true }); }, 400);
  }
  $('lv-los').addEventListener('click', () => {
    if (app.dataset.screen !== 's-level') return;
    K.fx.klick();
    if (S.level === 0 && !S.introGesehen) { intro(); return; }
    hudAufbauen();
    anrufStarten(lvStart(S.level));
  });

  /* ================= Level-Auswertung: Halbkreis-Messer wie in der Serie ================= */
  function levelEnde(l) {
    ++S.epoche;
    S.level = l;
    const lv = LV[l], LE = C.levelEnde, a0 = lvStart(l), n = lv.anzahl;
    S.i = a0 + n - 1;
    $('hud-beute-wert').textContent = euro(S.beute);
    const anrufe = C.anrufe.slice(a0, a0 + n), erg = anrufe.map((a, k) => S.ergebnisse[a0 + k]);
    const r = erg.filter(istRichtig).length, beute = erg.reduce((x, e) => x + ((e && e.beute) || 0), 0);
    const perfekt = r === n, gut = r * 2 >= n, letztes = l === LV.length - 1;
    const titel = perfekt ? LE.perfekt : gut ? f(LE.gut, { n: l + 1 }) : LE.knapp;
    const weiterText = letztes ? LE.zumErgebnis : (l === 0 && !S.pauseFertig ? LE.zumTipp : f(LE.naechstesLevel, { n: l + 2 }));
    const mitte = `<span class="m-symbol ${gut ? '' : 'nein'}"><svg viewBox="0 0 24 24"><path d="${gut ? 'm5 12.5 4.5 4.5L19 7.5' : 'M6.5 6.5l11 11M17.5 6.5l-11 11'}"/></svg></span>
      <span class="m-prozent">0 %</span><span class="m-richtig">${esc(f(LE.richtig, { richtig: r, gesamt: n }))}</span>`;
    $('le-karte').innerHTML = `
      <span class="pille-kicker ohne">${esc(f(LE.kicker, { n: l + 1, gesamt: LV.length }))}</span>${punkte(l)}
      <h1>${esc(titel)}</h1>
      ${messer(n ? r / n : 0, mitte)}
      <div class="le-kacheln">${erg.map((e, k) => `<span class="le-kachel ${istRichtig(e) ? 'ja' : 'nein'}" style="--i:${k}" title="${esc(anrufe[k].storyTitel)}">${istRichtig(e) ? HAKEN : KREUZ}</span>`).join('')}</div>
      <div class="le-beute ${beute ? '' : 'null'}"><img src="assets/hacker-face.png" alt=""><span><small>${esc(LE.beute)}</small><b>${beute ? euro(beute) : esc(LE.beuteNull)}</b></span></div>
      <details class="le-details"><summary><svg class="ico" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>${esc(LE.details)}</summary>
        <ol class="le-liste">${anrufe.map((a, k) => `<li class="${istRichtig(erg[k]) ? 'ja' : 'nein'}">${istRichtig(erg[k]) ? HAKEN : KREUZ}<span class="le-titel">${esc(a.storyTitel)}</span>
          <span class="tag ${a.echt ? 'tag-echt' : 'tag-fake'}">${esc(a.echt ? LE.warEcht : LE.warFake)}</span></li>`).join('')}</ol></details>
      <div class="le-fuss allein"><button class="btn btn-gross btn-mint" id="le-weiter" type="button">${esc(weiterText)} ${PFEIL}</button></div>`;
    zeige('s-levelende');
    K.musik('intro', 0.3, 1.5);
    messerStarten($('le-karte'));
    setTimeout(() => (gut ? K.fx.richtig : K.fx.falsch)(), reduziert ? 0 : 300);
    if (!beute) setTimeout(() => konfetti(perfekt ? 120 : 80, 'cct'), reduziert ? 0 : 1500);
    $('le-weiter').addEventListener('click', () => {
      K.fx.klick();
      if (letztes) ende();
      else if (l === 0 && !S.pauseFertig) pauseZeigen();
      else levelIntro(l + 1);
    });
    setTimeout(() => { const b = $('le-weiter'); if (b) b.focus({ preventScroll: true }); }, 900);
  }

  /* ================= Pause: Vishing-Nugget (erst die Lehren, dann die Frage) ================= */
  function pauseZeigen() {
    ++S.epoche;
    zeige('s-pause');
    K.musik('intro', 0.3, 2);
    const P = C.pause;
    $('pause-kicker').textContent = P.kicker; $('pause-titel').textContent = P.titel;
    $('nugget-lead').textContent = P.lead; $('nugget-zurueck').textContent = P.zurueck;
    $('nugget').hidden = false; $('pause-quiz').hidden = true;
    S.pause = null; S.karteMax = 0;
    $('nugget-punkte').innerHTML = P.karten.map((k, i) => `<button type="button" data-i="${i}" aria-label="${esc(f(P.lehre, { n: i + 1, gesamt: P.karten.length }))}"></button>`).join('');
    $('nugget-punkte').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { K.fx.klick(); karteZeigen(+b.dataset.i); }));
    karteZeigen(0);
  }
  function karteZeigen(i) {
    const P = C.pause, k = P.karten[i], n = P.karten.length, el = $('nugget-karte');
    S.karte = i; S.karteMax = Math.max(S.karteMax, i);
    el.style.setProperty('--farbe', k.farbe);
    el.innerHTML = `<span class="nk-icon">${icon(k.icon)}</span>
      <div class="nk-text"><p class="nk-nr">${esc(f(P.lehre, { n: i + 1, gesamt: n }))}</p><h3>${esc(k.titel)}</h3><p class="nk-inhalt">${esc(k.text)}</p>
        <p class="nk-beispiel">${chipHoerer}<span><b>${esc(P.beispiel)}:</b> ${esc(k.beispiel)}</span></p></div>`;
    el.classList.remove('rein'); void el.offsetWidth; el.classList.add('rein');
    // Punkte: bereits gesehene Lehren lassen sich wieder aufrufen, spätere noch nicht
    $('nugget-punkte').querySelectorAll('button').forEach((b, j) => { b.className = j === i ? 'an' : j <= S.karteMax ? 'fertig' : ''; b.disabled = j > S.karteMax; });
    $('nugget-zurueck').hidden = i === 0;
    $('nugget-weiter').innerHTML = esc(i === n - 1 ? P.zurFrage : P.weiter) + ' ' + PFEIL;
    K.fx.pop(i);
  }
  function karteWeiter() {
    K.fx.klick();
    if (S.karte < C.pause.karten.length - 1) karteZeigen(S.karte + 1); else frageZeigen();
  }
  $('nugget-weiter').addEventListener('click', karteWeiter);
  $('nugget-zurueck').addEventListener('click', () => { if (S.karte > 0) { K.fx.klick(); karteZeigen(S.karte - 1); } });

  function frageZeigen() {
    const P = C.pause, sc = $('s-pause'), inner = sc.querySelector('.pause-inner');
    $('nugget').hidden = true; $('pause-quiz').hidden = false;
    $('pause-titel').textContent = P.frageTitel;
    sc.scrollTop = 0;
    inner.classList.remove('rein'); void inner.offsetWidth; inner.classList.add('rein');
    $('pause-szene').textContent = P.szene; $('pause-frage').textContent = P.frage;
    $('pause-antwort').hidden = true; $('pause-regel').hidden = true; $('pause-weiter').hidden = true;
    S.pause = null;
    $('pause-optionen').innerHTML = P.optionen.map((o, i) =>
      `<button class="option pause-option" type="button" data-i="${i}" style="--i:${i};--farbe:${o.farbe || 'var(--lilac)'}"><span class="p-icon">${icon(o.icon)}</span><span class="p-text">${esc(o.text)}</span><kbd>${String.fromCharCode(65 + i)}</kbd></button>`).join('');
    $('pause-optionen').querySelectorAll('button').forEach(b => b.addEventListener('click', () => pauseWaehlen(+b.dataset.i)));
  }
  function pauseWaehlen(i) {
    if (S.pause != null) return;
    const P = C.pause, o = P.optionen[i];
    S.pause = o.wert;
    $('pause-optionen').querySelectorAll('button').forEach((b, k) => {
      b.disabled = true;
      b.classList.add(k === i ? 'gewaehlt' : 'nicht');
      if (P.optionen[k].wert === 'voll') b.classList.add('loesung');
      b.dataset.wert = P.optionen[k].wert;
    });
    (o.wert === 'voll' ? K.fx.richtig : o.wert === 'halb' ? K.fx.wahl : K.fx.falsch)();
    const an = $('pause-antwort'); an.dataset.wert = o.wert;
    $('pause-antwort-titel').textContent = o.titel; $('pause-antwort-text').textContent = o.erklaerung;
    an.hidden = false;
    $('pause-regel-titel').textContent = P.regel.titel;
    $('pause-regel-punkte').innerHTML = P.regel.punkte.map((r, k) => `<li style="--i:${k}">${icon(r.icon)}<div><b>${r.titel}</b><span>${r.text}</span></div></li>`).join('');
    setTimeout(() => {
      $('pause-regel').hidden = false; $('pause-weiter').hidden = false; $('pause-weiter').innerHTML = esc(f(C.levelEnde.naechstesLevel, { n: 2 })) + ' ' + PFEIL;
      scrollZu($('s-pause'), $('pause-weiter'));
    }, 500);
  }
  $('pause-weiter').addEventListener('click', () => {
    K.fx.klick(); S.pauseFertig = true;
    levelIntro(1);
  });

  /* ================= Auswertung (wie das Ergebnis der Serie) ================= */
  function ende() {
    ++S.epoche;
    const A = C.auswertung, N = C.anrufe.length;
    const erg = S.ergebnisse;
    const richtig = C.anrufe.filter((a, i) => istRichtig(erg[i])).length;
    const gut = erg.filter(Boolean).reduce((x, e) => x + (e.gut || 0), 0);
    const rang = A.raenge.find(r => N - richtig <= r.fehler);
    const hackerText = richtig >= N - 1 && !S.beute ? A.hackerGut : (richtig >= N - 2 ? A.hackerMittel : A.hackerSchlecht);
    const mitte = `<span class="m-prozent">0 %</span><span class="m-richtig">${richtig}/${N} ${esc(A.richtig)}</span>`;
    const akte = C.anrufe.map((a, i) => {
      const e = erg[i] || {};
      const st = !a.echt ? (e.zuSpaet ? 'zuSpaet' : e.richtig ? 'entlarvt' : 'getaeuscht') : (e.richtig ? 'echtErkannt' : 'fehlalarm');
      return `<li class="akte-${st}" style="--i:${i}"><span class="akte-nr">${i + 1}</span><div><b>${esc(a.storyTitel)}</b><span>${C.hud.level} ${levelVon(i) + 1} · ${a.echt ? 'Echt' : 'KI-Fake'} · ${esc(a.anrufer.name)}</span></div><em>${C.feedback[st].stempel}</em></li>`;
    }).join('');
    $('finale').innerHTML = `
      <div class="f-kopf">
        ${messer(richtig / N, mitte)}
        <div class="f-kopf-text">
          <span class="pille-kicker">${esc(A.titel)}</span>
          <h1 class="titel-gross">${esc(rang.titel)}</h1>
          <p class="lead">${esc(rang.text)}</p>
          <div class="f-zahlen">
            <div class="f-beute ${S.beute ? '' : 'null'}"><img src="assets/hacker-face.png" alt=""><span><b id="ende-beute">0 €</b><small>${esc(S.beute ? A.beuteVoll : A.beuteNull)}</small></span></div>
            <div class="f-nachgehakt"><b>${gut}×</b><small>${esc(A.nachgehakt)}</small></div>
          </div>
        </div>
      </div>
      <div class="hacker-sagt" id="ende-hacker" data-stimmung="${S.beute ? 'froh' : 'sauer'}"><img src="assets/hacker.png" alt=""><p id="ende-hacker-text"></p></div>
      <div class="f-raster">
        <section class="f-block karte"><h2>${esc(A.akte)}</h2><ol class="akte">${akte}</ol></section>
        <section class="f-block karte"><h2>${esc(A.regelnTitel)}</h2><ol class="regeln">${A.regeln.map((r, i) => `<li style="--i:${i}"><b>${esc(r.titel)}</b><span>${esc(r.text)}</span></li>`).join('')}</ol></section>
      </div>
      <button class="btn btn-gross btn-mint" id="ende-nochmal" type="button">${NOCHMAL}${esc(A.nochmal)}</button>
      <p class="quellen">${esc(A.quellen)}</p>
      <p class="quellen">${esc(A.kleingedruckt)}</p>`;
    zeige('s-ende');
    K.musik('auswertung', 0.45, 2);
    messerStarten($('finale'));
    zaehle($('ende-beute'), S.beute, euro, 1600);
    setTimeout(() => tippe($('ende-hacker-text'), hackerText, 26, true), reduziert ? 0 : 900);
    if (!reduziert) C.anrufe.forEach((a, i) => setTimeout(() => K.fx.pop(i), 700 + i * 160));
    setTimeout(() => (richtig >= N - 2 ? K.fx.richtig : K.fx.stempel)(), reduziert ? 0 : 500);
    if (!S.beute) setTimeout(() => konfetti(140, 'bunt'), reduziert ? 0 : 1300);
    $('ende-nochmal').addEventListener('click', () => { K.fx.klick(); neuesSpiel(); levelIntro(0); });
  }

  /* ================= Lage-Umschalter (schmal) ================= */
  $('lage-toggle').addEventListener('click', () => {
    const l = $('lage'); l.classList.toggle('zu');
    $('lage-toggle').setAttribute('aria-expanded', !l.classList.contains('zu'));
  });

  /* ================= Tastatur ================= */
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const scr = app.dataset.screen;
    if (scr === 's-spiel') {
      if (!$('urteil').hidden) {
        if (e.key === 'ArrowLeft') urteilen('echt');
        if (e.key === 'ArrowRight') urteilen('fake');
        return;
      }
      if (!$('feedback').hidden) return;
      const z = geraet.dataset.zustand;
      if (z === 'ring' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); annehmen(); }
      if (z === 'talk' && e.key === 'Escape') beenden('aufgelegt');
      if (z === 'talk' && !$('wahl').hidden && (e.key === '1' || e.key === '2')) waehlen(+e.key - 1);
    }
    if (scr === 's-level' && e.key === 'Enter' && document.activeElement !== $('lv-los')) { e.preventDefault(); $('lv-los').click(); }
    if (scr === 's-pause' && !$('nugget').hidden) {
      if (e.key === 'ArrowRight') karteWeiter();
      if (e.key === 'ArrowLeft') $('nugget-zurueck').click();
    } else if (scr === 's-pause' && S.pause == null) {
      const k = 'abcd'.indexOf(e.key.toLowerCase()); if (k >= 0) pauseWaehlen(k);
    }
  });

  /* ================= Start ================= */
  startAufbauen();
  untertitelSetzen(S.cc);
  zeige('s-start');

  // Testsprünge: #intro, #l1, #l2, #anruf1 … #anruf6, #e1, #e2, #pause, #frage, #ende
  const sprung = location.hash.slice(1);
  if (sprung) {
    const testErgebnisse = () => C.anrufe.forEach((a, i) => {
      const richtig = i !== 1;
      S.ergebnisse[i] = { richtig, zuSpaet: false, gut: i % 2 ? 1 : 2, beute: !a.echt && !richtig ? a.beute : 0, zuege: [], pfad: [] };
    });
    const los = () => {
      K.init();
      neuesSpiel();
      const m = /^anruf([1-9])$/.exec(sprung), l = /^l([1-9])$/.exec(sprung), e = /^e([1-9])$/.exec(sprung);
      if (m) {
        const n = Math.min(+m[1] - 1, C.anrufe.length - 1);
        S.pauseFertig = levelVon(n) > 0;
        hudAufbauen(); anrufStarten(n);
      } else if (l) { S.pauseFertig = +l[1] > 1; levelIntro(Math.min(+l[1] - 1, LV.length - 1)); }
      else if (e) { testErgebnisse(); S.beute = S.ergebnisse.reduce((x, r) => x + r.beute, 0); levelEnde(Math.min(+e[1] - 1, LV.length - 1)); }
      else if (sprung === 'intro') intro();
      else if (sprung === 'pause') pauseZeigen();
      else if (sprung === 'frage') { pauseZeigen(); frageZeigen(); }
      else if (sprung === 'ende') { testErgebnisse(); S.beute = S.ergebnisse.reduce((x, r) => x + r.beute, 0); ende(); }
    };
    $('start-los').innerHTML = 'Test: ' + esc(sprung);
    $('start-los').addEventListener('click', ev => { ev.stopImmediatePropagation(); los(); }, { capture: true });
  }
})();
