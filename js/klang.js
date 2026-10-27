/* ------------------------------------------------------------
   Klang — alles, was man hört.
   Web Audio für alles: Musik, Stimmen (durch einen Telefonfilter
   je nach Kanal), Atmo, Klingeltöne und die synthetischen
   UI-Geräusche. Stimmen werden vorab dekodiert; die Stille, die
   ElevenLabs v3 ans Ende hängt, schneiden wir beim Abspielen ab.
   ------------------------------------------------------------ */
(function () {
  const PFAD = {
    musik: n => 'assets/musik/' + n + '.mp3',
    sfx: n => 'assets/sfx/' + n + '.mp3',
    stem: n => 'assets/stem/' + n + '.mp3'
  };

  // Färbung der Leitung: Hochpass / Tiefpass / leichte Sättigung
  const LEITUNG = {
    telefon: { hp: 320, lp: 3300, drive: 0.35, gain: 1.15 },
    messenger: { hp: 140, lp: 7200, drive: 0.12, gain: 1.0 },
    teams: { hp: 90, lp: 9500, drive: 0.06, gain: 1.0 },
    erzaehler: { hp: 40, lp: 18000, drive: 0, gain: 1.0 }
  };

  const ATMO_VOL = { callcenter: 0.16, helpdesk: 0.09, homeoffice: 0.13 };

  let ctx = null, master = null, musikBus = null, stimmBus = null, analyser = null, sfxBus = null;
  let an = true;
  const puffer = {};          // url -> Promise<{buf, start, ende}>
  let musikQuelle = null, musikGain = null, musikName = null, musikZiel = 0;
  let duckFaktor = 1;
  let atmoQuelle = null, atmoGain = null;
  let ringQuelle = null, ringGain = null, vibTimer = null, vibQuellen = [];
  let aktiveStimme = null;
  const pegelDaten = new Float32Array(1024);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* älteres Safari */ }
    master = ctx.createGain(); master.gain.value = an ? 1 : 0; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    comp.connect(master);
    musikBus = ctx.createGain(); musikBus.gain.value = 1; musikBus.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(comp);
    stimmBus = ctx.createGain(); stimmBus.gain.value = 1;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.6;
    stimmBus.connect(analyser); analyser.connect(comp);
    // stiller Puffer als Wecker (iOS)
    const b = ctx.createBuffer(1, 1, 22050); const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
  }

  function setAn(wert) {
    an = wert;
    if (master) master.gain.setTargetAtTime(an ? 1 : 0, ctx.currentTime, 0.05);
  }

  /* ---------- Laden ---------- */
  function laden(url) {
    if (puffer[url]) return puffer[url];
    puffer[url] = fetch(url)
      .then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, nein) => { init(); ctx.decodeAudioData(ab, ok, nein); }))
      .then(buf => {
        const d = buf.getChannelData(0), sr = buf.sampleRate, schwelle = 0.02;
        let a = 0; while (a < d.length && Math.abs(d[a]) < schwelle) a++;
        let e = d.length - 1; while (e > a && Math.abs(d[e]) < schwelle) e--;
        const start = Math.max(0, a / sr - 0.06), ende = Math.min(buf.duration, e / sr + 0.28);
        return { buf, start, ende, huelle: sprechHuelle(d, sr, start, ende) };
      })
      .catch(err => { console.warn('Audio fehlt:', err.message); delete puffer[url]; return null; });
    return puffer[url];
  }
  // Kumulierter Sprechanteil je 20-ms-Fenster (0..1). Pausen zählen nicht – so bleiben die
  // Untertitel stehen, wenn der Anrufer Luft holt, und laufen weiter, wenn er spricht.
  const FENSTER = 0.02;
  function sprechHuelle(d, sr, start, ende) {
    const n = Math.max(1, Math.ceil((ende - start) / FENSTER)), w = Math.floor(sr * FENSTER);
    const rms = new Float32Array(n); let max = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.floor((start + i * FENSTER) * sr); let q = 0, k = 0;
      for (let j = a; j < a + w && j < d.length; j++) { q += d[j] * d[j]; k++; }
      rms[i] = k ? Math.sqrt(q / k) : 0; if (rms[i] > max) max = rms[i];
    }
    const schwelle = Math.max(0.008, max * 0.14), kum = new Float32Array(n);
    let summe = 0;
    for (let i = 0; i < n; i++) { if (rms[i] > schwelle) summe++; kum[i] = summe; }
    for (let i = 0; i < n; i++) kum[i] = summe ? kum[i] / summe : (i + 1) / n;
    return kum;
  }
  const stimmeLaden = id => laden(PFAD.stem(id));
  const sfxLaden = n => laden(PFAD.sfx(n));
  const musikLaden = n => laden(PFAD.musik(n));

  /* ---------- Leitung ---------- */
  function leitung(art, ziel) {
    const L = LEITUNG[art] || LEITUNG.erzaehler;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = L.hp; hp.Q.value = 0.7;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = L.lp; lp.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = L.gain;
    hp.connect(lp);
    let letzter = lp;
    if (L.drive > 0) {
      const ws = ctx.createWaveShaper(); const n = 1024, kurve = new Float32Array(n), k = L.drive * 20;
      for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; kurve[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
      ws.curve = kurve; lp.connect(ws); letzter = ws;
      g.gain.value = L.gain / (1 + L.drive * 1.6);
    }
    letzter.connect(g); g.connect(ziel);
    return hp;
  }

  /* ---------- Stimmen ---------- */
  // Spielt eine Zeile; resolves mit {dauer} sobald sie gestartet ist. onEnde wird beim (gekürzten) Ende gerufen.
  async function stimme(id, art, onEnde) {
    stimmeStop();
    init();
    const p = await stimmeLaden(id);
    const token = {};
    aktiveStimme = token;
    if (!p) { // ohne Datei: Lesezeit simulieren
      const dauer = 4;
      token.t0 = performance.now(); token.dauer = dauer;
      token.timer = setTimeout(() => { if (aktiveStimme === token) { aktiveStimme = null; onEnde && onEnde(); } }, dauer * 1000);
      token.stop = () => clearTimeout(token.timer);
      return token;
    }
    const src = ctx.createBufferSource(); src.buffer = p.buf;
    src.connect(leitung(art, stimmBus));
    const dauer = p.ende - p.start;
    const t = ctx.currentTime + 0.05;
    src.start(t, p.start, dauer + 0.05);
    token.src = src; token.dauer = dauer; token.ctxStart = t; token.huelle = p.huelle;
    token.stop = () => { try { src.stop(); } catch (e) { } };
    src.onended = () => { if (aktiveStimme === token) { aktiveStimme = null; onEnde && onEnde(); } };
    if (art === 'erzaehler') duck(true);
    return token;
  }
  function stimmeStop() {
    if (aktiveStimme) { const t = aktiveStimme; aktiveStimme = null; t.stop && t.stop(); }
    duck(false);
  }
  // Fortschritt 0..1 der laufenden Zeile (für die Untertitel)
  function fortschritt() {
    const t = aktiveStimme; if (!t) return null;
    if (t.ctxStart != null) return Math.max(0, Math.min(1, (ctx.currentTime - t.ctxStart) / t.dauer));
    return Math.min(1, (performance.now() - t.t0) / (t.dauer * 1000));
  }
  // Fortschritt nach gesprochener Zeit (für die Untertitel); ohne Hüllkurve wie fortschritt()
  function textFortschritt() {
    const t = aktiveStimme; if (!t) return null;
    if (!t.huelle || t.ctxStart == null) return fortschritt();
    const i = Math.floor((ctx.currentTime - t.ctxStart) / FENSTER);
    if (i < 0) return 0;
    return t.huelle[Math.min(i, t.huelle.length - 1)];
  }
  function pegel() {
    if (!analyser) return 0;
    analyser.getFloatTimeDomainData(pegelDaten);
    let s = 0; for (let i = 0; i < pegelDaten.length; i++) s += pegelDaten[i] * pegelDaten[i];
    return Math.min(1, Math.sqrt(s / pegelDaten.length) * 4.5);
  }

  /* ---------- Musik ---------- */
  async function musik(name, vol, fade) {
    init(); if (!ctx) return;
    fade = fade == null ? 1.2 : fade;
    if (name === musikName && musikGain) { musikVol(vol, fade); return; }
    musikAus(fade);
    musikName = name;
    if (!name) return;
    const p = await musikLaden(name);
    if (!p || musikName !== name) return;
    const g = ctx.createGain(); g.gain.value = 0; g.connect(musikBus);
    const src = ctx.createBufferSource(); src.buffer = p.buf; src.loop = true; src.connect(g);
    src.start();
    musikQuelle = src; musikGain = g; musikZiel = vol;
    g.gain.setTargetAtTime(vol * duckFaktor, ctx.currentTime, fade / 3);
  }
  function musikVol(vol, fade) {
    musikZiel = vol;
    if (musikGain) musikGain.gain.setTargetAtTime(vol * duckFaktor, ctx.currentTime, (fade == null ? 0.8 : fade) / 3);
  }
  function musikAus(fade, linear) {
    musikName = null;
    if (!musikGain) return;
    const g = musikGain, s = musikQuelle; musikGain = null; musikQuelle = null;
    const f = fade == null ? 0.8 : fade, jetzt = ctx.currentTime;
    g.gain.cancelScheduledValues(jetzt);
    if (linear) { g.gain.setValueAtTime(g.gain.value, jetzt); g.gain.linearRampToValueAtTime(0, jetzt + f); }
    else g.gain.setTargetAtTime(0, jetzt, Math.max(0.01, f / 4));
    setTimeout(() => { try { s.stop(); } catch (e) { } g.disconnect(); }, f * 1000 + 300);
  }
  function duck(ja) {
    duckFaktor = ja ? 0.4 : 1;
    if (musikGain) musikGain.gain.setTargetAtTime(musikZiel * duckFaktor, ctx.currentTime, 0.25);
  }

  /* ---------- Atmo & Klingeln ---------- */
  async function atmo(name, art) {
    atmoStop();
    if (!name) return;
    const p = await sfxLaden('atmo-' + name);
    if (!p) return;
    const g = ctx.createGain(); g.gain.value = 0;
    g.connect(leitung(art, musikBus));
    const src = ctx.createBufferSource(); src.buffer = p.buf; src.loop = true; src.connect(g); src.start();
    g.gain.setTargetAtTime(ATMO_VOL[name] || 0.1, ctx.currentTime, 0.3);
    atmoQuelle = src; atmoGain = g;
  }
  function atmoStop() {
    if (!atmoGain) return;
    const g = atmoGain, s = atmoQuelle; atmoGain = null; atmoQuelle = null;
    g.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    setTimeout(() => { try { s.stop(); } catch (e) { } }, 400);
  }
  async function ring(name, mitVibration) {
    init(); ringStop();
    const token = {}; ring.token = token;
    const [p, v] = await Promise.all([sfxLaden('ring-' + name), mitVibration ? sfxLaden('vibration') : null]);
    if (ring.token !== token) return;
    if (p) {
      const g = ctx.createGain(); g.gain.value = 0.55; g.connect(sfxBus);
      const src = ctx.createBufferSource(); src.buffer = p.buf; src.loop = true; src.connect(g); src.start();
      ringQuelle = src; ringGain = g;
    } else synthRing();
    if (mitVibration && v) {
      const buzz = () => {
        const s = ctx.createBufferSource(); s.buffer = v.buf; const g = ctx.createGain(); g.gain.value = 0.7;
        s.connect(g); g.connect(sfxBus); s.start();
        vibQuellen.push(s); s.onended = () => { vibQuellen = vibQuellen.filter(q => q !== s); };
      };
      buzz(); vibTimer = setInterval(buzz, 3000);
    }
  }
  function ringStop() {
    ring.token = null;
    clearInterval(vibTimer); vibTimer = null;
    vibQuellen.forEach(q => { try { q.stop(); } catch (e) { } }); vibQuellen = [];
    if (synthRing.timer) { clearInterval(synthRing.timer); synthRing.timer = null; }
    if (!ringGain) return;
    const g = ringGain, s = ringQuelle; ringGain = null; ringQuelle = null;
    g.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    setTimeout(() => { try { s.stop(); } catch (e) { } }, 250);
  }
  function synthRing() { // Ersatz, falls die Datei fehlt
    const eins = () => { ton(880, 0.12, 0.18, 'sine'); setTimeout(() => ton(1100, 0.12, 0.18, 'sine'), 160); };
    eins(); synthRing.timer = setInterval(eins, 1600);
  }

  async function einmal(name, vol) {
    init(); const p = await sfxLaden(name); if (!p) return;
    const g = ctx.createGain(); g.gain.value = vol == null ? 0.8 : vol; g.connect(sfxBus);
    const s = ctx.createBufferSource(); s.buffer = p.buf; s.connect(g); s.start();
  }

  /* ---------- Synthetische UI-Geräusche ---------- */
  function ton(freq, dauer, vol, typ, zuFreq, verz) {
    if (!ctx) return;
    const t = ctx.currentTime + (verz || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = typ || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (zuFreq) o.frequency.exponentialRampToValueAtTime(zuFreq, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dauer + 0.05);
  }
  let rauschPuffer = null;
  function rauschen(dauer, vol, von, bis, verz, typ) {
    if (!ctx) return;
    if (!rauschPuffer) {
      rauschPuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = rauschPuffer.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + (verz || 0);
    const s = ctx.createBufferSource(); s.buffer = rauschPuffer; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = typ || 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(von, t); f.frequency.exponentialRampToValueAtTime(bis, t + dauer);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dauer * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dauer + 0.05);
  }

  const fx = {
    klick() { init(); ton(1800, 0.04, 0.08, 'triangle'); },
    hover() { ton(2400, 0.025, 0.025, 'sine'); },
    wahl() { init(); ton(660, 0.08, 0.12, 'triangle'); ton(990, 0.12, 0.1, 'triangle', null, 0.06); },
    verbinden() { init(); ton(1400, 0.03, 0.12, 'square'); rauschen(0.18, 0.05, 3000, 800, 0.02); },
    auflegen() { init(); for (let i = 0; i < 3; i++) ton(425, 0.22, 0.13, 'sine', null, i * 0.44); },
    whoosh() { init(); rauschen(0.5, 0.12, 400, 4000); },
    tippen() { ton(3000 + Math.random() * 800, 0.012, 0.02, 'square'); },
    stempel() {
      init(); ton(110, 0.25, 0.4, 'sine', 50); rauschen(0.16, 0.25, 1800, 300, 0, 'lowpass');
    },
    richtig() { init(); ton(523, 0.16, 0.16, 'triangle'); ton(784, 0.18, 0.16, 'triangle', null, 0.1); ton(1046, 0.34, 0.14, 'triangle', null, 0.2); },
    falsch() { init(); ton(220, 0.28, 0.16, 'sawtooth', 140); ton(165, 0.4, 0.14, 'sawtooth', 110, 0.16); },
    muenze(i) { ton(1500 + (i % 5) * 120, 0.06, 0.06, 'square'); ton(2600 + (i % 5) * 160, 0.05, 0.04, 'square', null, 0.03); },
    glitch(vol) { init(); einmal('glitch', vol == null ? 0.9 : vol); },
    bass() { init(); ton(55, 1.6, 0.35, 'sine', 40); rauschen(1.2, 0.05, 200, 60, 0, 'lowpass'); },
    enthuellung() { init(); rauschen(1.4, 0.08, 6000, 300); ton(880, 1.2, 0.05, 'sine', 220); },
    // Intro: dumpfer Schlag beim Szenenwechsel, Aufnahme-Piep, Scan-Wischer, Bestätigung
    schlag() { init(); ton(48, 0.9, 0.42, 'sine', 32); rauschen(0.35, 0.09, 900, 120, 0, 'lowpass'); },
    rec() { init(); ton(1320, 0.09, 0.07, 'sine'); },
    scan() { init(); rauschen(0.9, 0.05, 300, 5200, 0, 'bandpass'); },
    fertig() { init(); ton(1760, 0.05, 0.06, 'square'); ton(2350, 0.08, 0.05, 'square', null, 0.06); },
    // Feedback: Chips poppen auf, Details klappen auf
    pop(i) { ton(900 + (i || 0) * 90, 0.05, 0.05, 'triangle'); },
    aufdecken() { ton(520, 0.06, 0.06, 'triangle', 780); },
    // Hacker: lacht (hat gewonnen), knurrt (durchschaut), gähnt (echter Anruf, magere Beute)
    hackerHaha() { init(); [0, 0.11, 0.22].forEach((t, i) => ton(523 - i * 60, 0.09, 0.06, 'triangle', null, t)); ton(330, 0.3, 0.05, 'triangle', null, 0.36); },
    hackerGrr() { init(); ton(196, 0.32, 0.07, 'sawtooth', 98); rauschen(0.25, 0.04, 1500, 300, 0.05); },
    hackerGaehn() { init(); ton(300, 0.7, 0.07, 'sine', 150); }
  };

  window.Klang = {
    init, setAn, get an() { return an; },
    laden, stimmeLaden, sfxLaden, musikLaden,
    stimme, stimmeStop, fortschritt, textFortschritt, pegel,
    musik, musikVol, musikAus,
    atmo, atmoStop, ring, ringStop, einmal,
    fx,
    get ctx() { return ctx; }
  };
})();
