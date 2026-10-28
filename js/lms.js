/* ------------------------------------------------------------------
   LMS – SCORM 1.2 und SCORM 2004 in einem (wie in der Phishing Challenge).
   Ohne LMS (Website, Vorschau) tut das Modul nichts und merkt sich nichts.
   Alle Aufrufe sind abgesichert: Ein zickiges LMS darf die Challenge
   nie zum Absturz bringen.
   ------------------------------------------------------------------ */
window.LMS = (function () {
  'use strict';
  var api = null, ver = null, offen = false, beendet = false, start = Date.now();
  var log = [];

  function suche(win) {
    var n = 0;
    while (win && n < 20) {
      try {
        if (win.API_1484_11) { ver = '2004'; return win.API_1484_11; }
        if (win.API) { ver = '1.2'; return win.API; }
      } catch (e) { /* fremder Ursprung */ }
      try {
        if (win.parent && win.parent !== win) win = win.parent; else break;
      } catch (e) { break; }
      n++;
    }
    return null;
  }
  function finde() {
    var a = suche(window);
    if (!a) { try { if (window.opener) a = suche(window.opener); } catch (e) {} }
    return a;
  }

  // Schlüssel je Version
  var K = {
    '1.2': {
      ort: 'cmi.core.lesson_location', daten: 'cmi.suspend_data',
      status: 'cmi.core.lesson_status', raw: 'cmi.core.score.raw', min: 'cmi.core.score.min', max: 'cmi.core.score.max',
      exit: 'cmi.core.exit', zeit: 'cmi.core.session_time'
    },
    '2004': {
      ort: 'cmi.location', daten: 'cmi.suspend_data',
      status: 'cmi.completion_status', erfolg: 'cmi.success_status', raw: 'cmi.score.raw', min: 'cmi.score.min',
      max: 'cmi.score.max', skaliert: 'cmi.score.scaled', exit: 'cmi.exit', zeit: 'cmi.session_time'
    }
  };

  function hole(k) {
    if (!api) return '';
    try { return String((ver === '2004' ? api.GetValue(k) : api.LMSGetValue(k)) || ''); } catch (e) { return ''; }
  }
  function setze(k, v) {
    if (!api) return false;
    try {
      var ok = ver === '2004' ? api.SetValue(k, String(v)) : api.LMSSetValue(k, String(v));
      log.push([k, String(v).slice(0, 80), ok]);
      return ok === true || ok === 'true';
    } catch (e) { return false; }
  }
  function commit() {
    if (!api) return;
    try { if (ver === '2004') api.Commit(''); else api.LMSCommit(''); } catch (e) {}
  }

  function dauer12(ms) {
    var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
    s = s % 60;
    function z(x, n) { x = String(x); while (x.length < n) x = '0' + x; return x; }
    return z(h, 4) + ':' + z(m, 2) + ':' + z(s, 2);
  }
  function dauer2004(ms) {
    var s = Math.floor(ms / 1000);
    return 'PT' + Math.floor(s / 3600) + 'H' + Math.floor(s % 3600 / 60) + 'M' + (s % 60) + 'S';
  }

  var istFertig = false, interaktionen = 0;

  return {
    log: log,
    init: function () {
      api = finde();
      if (!api) return false;
      try {
        var r = ver === '2004' ? api.Initialize('') : api.LMSInitialize('');
        offen = r === true || r === 'true';
      } catch (e) { offen = false; }
      if (!offen) { api = null; return false; }
      var k = K[ver];
      var st = hole(k.status);
      istFertig = /passed|completed/.test(st) || (ver === '2004' && hole(k.erfolg) === 'passed');
      // Solange nicht alle Levels bestanden sind, bleibt der Kurs „incomplete“ – nie „completed“
      if (!istFertig) {
        if (ver === '2004') setze(k.status, 'incomplete');
        else if (st === '' || st === 'not attempted' || st === 'unknown') setze(k.status, 'incomplete');
      }
      setze(k.exit, 'suspend');
      try { interaktionen = parseInt(hole('cmi.interactions._count'), 10) || 0; } catch (e) {}
      commit();
      return true;
    },
    aktiv: function () { return !!api; },
    version: function () { return ver; },

    laden: function () {
      if (!api) return null;
      var roh = hole(K[ver].daten);
      if (!roh) return null;
      try { return JSON.parse(roh); } catch (e) { return null; }
    },
    speichern: function (stand, ort) {
      if (!api) return;
      setze(K[ver].daten, JSON.stringify(stand));
      if (ort) setze(K[ver].ort, ort);
      commit();
    },

    // Ein Urteil als Interaktion (für Auswertungen im LMS)
    interaktion: function (id, antwort, richtigeAntwort, korrekt) {
      if (!api) return;
      var n = interaktionen++, p = 'cmi.interactions.' + n + '.';
      setze(p + 'id', id);
      setze(p + 'type', 'choice');
      setze(p + 'correct_responses.0.pattern', richtigeAntwort);
      if (ver === '2004') {
        setze(p + 'learner_response', antwort);
        setze(p + 'result', korrekt ? 'correct' : 'incorrect');
        setze(p + 'timestamp', new Date().toISOString().slice(0, 19));
      } else {
        setze(p + 'student_response', antwort);
        setze(p + 'result', korrekt ? 'correct' : 'wrong');
        setze(p + 'time', new Date().toTimeString().slice(0, 8));
      }
      commit();
    },

    // Fortschritt 0…1 (bestandene Level / alle Level). Nur SCORM 2004 hat dafür ein Feld.
    fortschritt: function (anteil) {
      if (!api || ver !== '2004') return;
      setze('cmi.progress_measure', String(Math.round(Math.max(0, Math.min(1, anteil)) * 100) / 100));
      commit();
    },

    // Alle Levels bestanden: Punktzahl + Status (2004: completed + passed, 1.2: passed)
    abschliessen: function (prozent, bestanden) {
      if (!api) return false;
      var k = K[ver], p = Math.round(prozent);
      // Ein früheres "passed" nie verschlechtern
      if (!(istFertig && !bestanden)) {
        setze(k.min, '0'); setze(k.max, '100'); setze(k.raw, String(p));
        if (ver === '2004') {
          setze(k.skaliert, String(p / 100));
          setze(k.status, bestanden ? 'completed' : 'incomplete');
          setze(k.erfolg, bestanden ? 'passed' : 'failed');
        } else {
          setze(k.status, bestanden ? 'passed' : 'incomplete');
        }
      }
      if (bestanden) istFertig = true;
      setze(k.exit, ver === '2004' ? 'normal' : '');
      commit();
      return true;
    },

    beenden: function () {
      if (!api || beendet) return;
      beendet = true;
      var k = K[ver], ms = Date.now() - start;
      setze(k.zeit, ver === '2004' ? dauer2004(ms) : dauer12(ms));
      commit();
      try { if (ver === '2004') api.Terminate(''); else api.LMSFinish(''); } catch (e) {}
    }
  };
})();
