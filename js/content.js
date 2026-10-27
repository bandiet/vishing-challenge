/* ------------------------------------------------------------
   Vishing Challenge — alle Texte, Abläufe und Zahlen.
   Gesprochene Zeilen: `tts` ist exakt der Text, der bei
   ElevenLabs (eleven_v3) eingesprochen wurde; die Untertitel
   entstehen daraus, indem die [Regieanweisungen] wegfallen.
   Wer eine Zeile ändert, muss die Aufnahme neu erzeugen
   (gleicher Dateiname in assets/stem/).
   ------------------------------------------------------------ */
window.CONTENT = {
  titel: 'Vishing Challenge',
  untertitel: 'Mensch oder KI? Betrug am Telefon erkennen',
  marke: 'Cyber Crime Time',

  start: {
    titel: 'Vishing Challenge',
    akzent: 'Vishing',             // dieses Wort bekommt den Verlauf
    knopf: 'Challenge starten',
    kern: 'Sechs Anrufe, sechs Entscheidungen: Sprichst du mit einem echten Menschen – oder mit einer KI, die dich hereinlegen will?',
    fakten: ['6 Anrufe in 2 Levels', 'Mit Ton – am besten mit Kopfhörern', 'Jeder Fake, der dich täuscht, füllt die Kasse des Hackers']
  },

  /* Intro ohne Stimme: eine Stimmklon-Werkbank bei der Arbeit, dann Stille, dann klingelt es. */
  intro: {
    kopf: 'deepfake-kit · bereit',
    beats: [
      { art: 'audio', gross: '3 Sekunden Audio.', klein: 'Mehr braucht es nicht.', ergebnis: 'Stimme geklont' },
      { art: 'frage', gross: 'Echt oder Fake?', klein: 'Hören kannst du den Unterschied nicht mehr.' },
      { art: 'du', gross: 'Du entscheidest.', klein: 'Sechs Anrufe. Hör genau hin. Hak nach.' },
      { art: 'ring', gross: 'Gleich klingelt dein Telefon.' }
    ],
    foto: 'assets/intro-gesicht.jpg',
    skip: 'Überspringen'
  },

  hud: {
    titel: 'Cyber Crime Awareness · Vishing Challenge',
    level: 'Level',
    anruf: 'Anruf',
    beute: 'Hacker-Beute',
    ton: 'Ton'
  },

  telefon: {
    eingehend: 'Eingehender Anruf',
    annehmen: 'Annehmen',
    ablehnen: 'Ablehnen',
    ablehnenTipp: 'Heute gehst du ran – auflegen kannst du jederzeit.',
    auflegen: 'Auflegen',
    duSagst: 'Du sagst …',
    beendet: 'Anruf beendet',
    verbindungWeg: 'Verbindung unterbrochen',
    lage: 'Lage',
    weiterhoeren: 'Nochmal hören',
    untertitel: 'Live-Untertitel'
  },

  urteil: {
    frage: 'Mensch oder KI?',
    sub: 'Was steckt hinter diesem Anruf?',
    echt: { titel: 'ECHT', text: 'Ein Mensch mit echtem Anliegen' },
    fake: { titel: 'FAKE', text: 'KI-Betrug – auflegen & prüfen' }
  },

  /* Feedback im Panel wie in der Phishing Challenge: titel (Ergebnis), text (allgemeine Rückmeldung;
     {beute} = beuteText, {schaden} = schadenText des Anrufs), darunter das Entscheidende (kern des Anrufs).
     „Details anzeigen“ geht die Signale einzeln durch, zum Schluss „Das schützt dich“ (tipp des Anrufs).
     stempel steht in der Auswertung neben jedem Anruf. */
  feedback: {
    entlarvt: { stempel: 'Entlarvt', titel: 'Entlarvt!', text: 'Das war ein KI-Fake – und du hast ihn erkannt. Der Hacker geht leer aus.' },
    getaeuscht: { stempel: 'Getäuscht', titel: 'Getäuscht!', text: 'Das war ein KI-Fake. Der Hacker kassiert: {beute}.' },
    echtErkannt: { stempel: 'Echt', titel: 'Echt erkannt!', text: 'Richtig – der Anruf war echt.' },
    fehlalarm: { stempel: 'Fehlalarm', titel: 'Fehlalarm!', text: 'Der Anruf war echt. Kein Schaden: Lieber einmal zu viel geprüft als einmal zu wenig. Aber hier sprach vieles für einen echten Anruf.' },
    zuSpaet: { stempel: 'Zu spät', titel: 'Zu spät!', text: 'Richtig erkannt – aber zu spät. {schaden} Der Hacker kassiert: {beute}.' },
    kern: 'Das Entscheidende',
    details: 'Details anzeigen',
    ueberspringen: 'Hinweise überspringen',
    zaehler: 'Hinweis {n} von {gesamt}',
    art: { rot: 'Warnsignal', gruen: 'Spricht für echt', info: 'Gut zu wissen', schutz: 'Zum Mitnehmen' },
    tipp: 'Das schützt dich',
    weiter: 'Weiter',
    naechsterAnruf: 'Nächster Anruf',
    zurLevelAuswertung: 'Zur Level-Auswertung'
  },

  /* Klick auf die Hacker-Beute oben: der Hacker fliegt herein und sagt, was er von seiner Kasse hält.
     leer = 0 €, klein = bis 1.000 €, mittel = bis 100.000 €, gross = darüber; {beute} = der Stand. */
  hackerKasse: {
    leer: ['Leer. Komplett leer. 😤', 'Null Euro. Ich sollte umschulen …', 'In meiner Kasse liegt nur Staub. 🕸️', 'Hör auf zu klicken – da ist nichts drin! 😒'],
    klein: ['{beute}? Das reicht gerade für Pizza. 🍕', 'Kleingeld. Aber ich bin geduldig … 😏', 'Immerhin. Der Anfang ist gemacht. 💰'],
    mittel: ['{beute}! Das neue Gaming-Setup ist gesichert. 😎', 'Läuft bei mir! 💸', '{beute} – nicht schlecht für ein paar Anrufe. 😈'],
    gross: ['{beute}! Ich schau mir schon mal Jachten an. 🛥️', 'Danke! Mein Ruhestand rückt näher. 🏝️', 'Ich liebe Telefonieren! 🤑']
  },

  /* ---------------- die sechs Anrufe (Reihenfolge = Spielreihenfolge; Level siehe unten) ---------------- */
  anrufe: [
    {
      id: 'c1',
      echt: false,
      kanal: 'whatsapp',           // WhatsApp-Audioanruf auf dem Handy
      geraet: 'phone',
      stimme: 'aTTiK3YzK3dXETpuDE2h', // Ben
      klang: 'messenger',           // leichte Telefonfärbung
      atmo: null,                   // auffällig still
      klingel: 'messenger',
      zeit: 'Samstag, 23:14',
      storyTitel: 'Jonas? Von dieser Nummer?',
      lage: 'Dein Bruder Jonas ist in Italien im Urlaub, sein Instagram ist voller Strandvideos. Kurz vor Mitternacht: ein WhatsApp-Anruf von einer unbekannten Nummer.',
      anrufer: { name: '+39 351 448 2097', zeile: 'WhatsApp-Audio · Italien', initialen: '?', farbe: '#5B6B8C' },
      start: { id: 'c1_0', tts: '[panicked] Hey, ich bin’s, Jonas! Bitte leg nicht auf! Mein Handy ist weg, ich ruf von ’nem fremden Handy an… [breathing heavily] Ich hatte ’nen Unfall mit dem Roller. Mir ist nichts passiert, aber das Auto von dem Mann ist total kaputt. Die Polizei ist hier und sagt, ich muss sofort achthundert Euro Kaution zahlen, sonst nehmen die mich mit. Kannst du mir das schicken? Bitte, jetzt gleich! [pause]' },
      runden: [
        [
          { text: 'Oh nein! Wohin soll ich das Geld schicken?', wert: 'riskant',
            antwort: { id: 'c1_1a', tts: '[relieved] Danke, danke! Der Polizist hier gibt mir gleich ’ne Kontonummer. Mach bitte ’ne Echtzeitüberweisung, dann ist das Geld sofort da. Aber beeil dich, die werden hier echt ungeduldig! [pause]' } },
          { text: 'Moment. Wie hieß Omas Katze?', wert: 'gut',
            antwort: { id: 'c1_1b', tts: '[frustrated] Was?! Ich steh hier mit der Polizei und du willst ein Quiz machen?! [sighs] Keine Ahnung, ich bin total durch… Bitte, ich brauch das Geld jetzt, nicht in ’ner Stunde! [pause]' } }
        ],
        [
          { text: 'Okay. Schick mir die Kontodaten.', wert: 'riskant',
            antwort: { id: 'c1_2a', tts: '[relieved] Danke! Ich schick dir alles per WhatsApp. Und… bitte sag Mama nichts, okay? Die flippt sonst total aus. Ich meld mich! [pause]' } },
          { text: 'Ich leg auf und ruf dich auf deiner normalen Nummer an.', wert: 'gut',
            antwort: { id: 'c1_2b', tts: '[panicked] Nein, nein, nicht auflegen! Mein Handy ist doch weg, da erreichst du mich nicht! Bitte, die nehmen mich sonst mit… [pause]' } }
        ]
      ],
      signale: [
        { art: 'rot', titel: 'Unbekannte Nummer, „Handy weg“', text: 'Der klassische Einstieg beim Schockanruf: So erklärt der Betrüger, warum er nicht von Jonas’ Nummer anruft.' },
        { art: 'rot', titel: 'Angst und extremer Zeitdruck', text: '„Jetzt gleich“, „sonst nehmen die mich mit“ – Panik soll verhindern, dass du nachdenkst.' },
        { art: 'rot', titel: 'Geld per Echtzeitüberweisung', text: 'Keine Polizei der Welt kassiert Kaution per Überweisung an ein Konto, das dir am Telefon genannt wird. Echtzeitüberweisungen lassen sich kaum zurückholen.' },
        { art: 'rot', titel: 'Weicht der Kontrollfrage aus', text: 'Statt zu antworten, macht er mehr Druck. Echte Angehörige kennen Omas Katze.', wenn: 'c1_1b' },
        { art: 'rot', titel: '„Sag Mama nichts“', text: 'Geheimhaltung isoliert dich – niemand soll dir raten, erst einmal nachzuprüfen.', wenn: 'c1_2a' },
        { art: 'rot', titel: 'Kein Rückruf erlaubt', text: 'Wer wirklich in Not ist, hat nichts gegen einen Rückruf über einen bekannten Weg – oder über seine Freunde vor Ort.', wenn: 'c1_2b' },
        { art: 'info', titel: 'Die Stimme klang echt', text: 'Jonas’ Strandvideos liefern genug Material für einen Stimmklon. Auch die verdächtige Stille im Hintergrund – angeblich mitten im Unfallchaos – ist nur ein schwacher Hinweis. Verlass dich nicht auf dein Ohr.' }
      ],
      kern: 'Unbekannte Nummer, Panik, Geld sofort – und ein Rückruf ist „nicht möglich“. Das ist das Muster des Schockanrufs, egal wie echt die Stimme klingt.',
      tipp: 'Auflegen. Jonas über seine bekannte Nummer anrufen – oder jemanden, der bei ihm ist. Vereinbart in der Familie ein Codewort für echte Notfälle.',
      hacker: { reingelegt: '800 € für ein paar Sekunden Instagram-Audio. Lohnt sich!', erwischt: 'Mist. Die Stimme war doch perfekt …' },
      beute: 800,
      beuteText: '800 € Kaution'
    },

    {
      id: 'c3',
      echt: false,
      kanal: 'teams',
      geraet: 'teams',
      extern: true,
      stimme: 'qVRpsZJDV29g1CIPzssm', // Sebastian
      klang: 'teams',
      atmo: 'helpdesk',
      klingel: 'teams',
      zeit: 'Montag, 9:40',
      storyTitel: 'Was ist mit meinem Postfach los?',
      lage: 'Seit 9 Uhr fluten Hunderte Spam-Mails dein Postfach. Du kommst kaum hinterher. Da klingelt Teams: der „IT-Helpdesk“.',
      anrufer: { name: 'IT-Helpdesk Support', zeile: 'it-helpdesk-support.onmicrosoft.com', initialen: 'IT', farbe: '#4A55C9', badge: 'Extern' },
      start: { id: 'c3_0', tts: 'Hallo, hier ist Marcel vom IT-Helpdesk. Wir sehen gerade, dass Ihr Postfach mit Spam regelrecht bombardiert wird – haben Sie sicher schon gemerkt. Das ist ein laufender Angriff, da sind mehrere Kollegen betroffen. Ich würde das gern sofort für Sie filtern, bevor da was Schlimmeres reinrutscht. Haben Sie zwei Minuten? [pause]' },
      runden: [
        [
          { text: 'Ja, bitte! Was muss ich tun?', wert: 'riskant',
            antwort: { id: 'c3_1a', tts: 'Super. Drücken Sie bitte einmal die Windows-Taste und tippen Sie „Remotehilfe“ ein. Ich gebe Ihnen gleich einen Code, dann schalte ich mich kurz auf Ihren Rechner. Dauert keine fünf Minuten. [pause]' } },
          { text: 'Gibt’s dazu ein Ticket? Ich hab nichts gemeldet.', wert: 'gut',
            antwort: { id: 'c3_1b', tts: '[chuckles] Nein, ein Ticket gibt’s dafür noch nicht – wir sind ja proaktiv dran, das läuft gerade alles parallel. Ehrlich gesagt: Je länger wir warten, desto größer das Risiko. Ich brauche nur kurz Zugriff über die Remotehilfe, dann ist das erledigt. [pause]' } }
        ],
        [
          { text: 'Okay, ich öffne die Remotehilfe.', wert: 'riskant',
            antwort: { id: 'c3_2a', tts: 'Perfekt. Der Code lautet: sieben, vier, eins, neun, zwei, acht. Geben Sie den ein und klicken Sie auf „Zulassen“… Sehr gut. Ich übernehme ab hier. [pause]' } },
          { text: 'Ich rufe lieber selbst bei der IT-Hotline an.', wert: 'gut',
            antwort: { id: 'c3_2b', tts: '[sighs] Die Hotline ist gerade komplett überlastet, genau wegen dieses Angriffs – da warten Sie ewig. Wenn Ihr Konto in der Zwischenzeit gesperrt wird, kann ich auch nichts mehr machen… Na gut. Ihre Entscheidung. [pause]' } }
        ]
      ],
      signale: [
        { art: 'rot', titel: '„Extern“ im Teams-Anruf', text: 'Deine IT ruft aus dem eigenen Unternehmen an – nicht von einem fremden Konto wie „…onmicrosoft.com“.' },
        { art: 'rot', titel: 'Verdächtig gutes Timing', text: 'Die Spam-Flut war kein Zufall: Angreifer lösen sie selbst aus, um danach als „Retter“ anzurufen. Diese Masche läuft 2026 gezielt gegen Unternehmen.' },
        { art: 'rot', titel: 'Fernzugriff über die Remotehilfe', text: 'Wer auf deinen Bildschirm darf, sieht und steuert alles – Passwörter, Daten, Netzwerk. In echten Fällen lag zwischen so einem Anruf und verschlüsselten Servern weniger als ein Tag.' },
        { art: 'rot', titel: 'Kein Ticket, aber Druck', text: '„Je länger wir warten …“, „Hotline überlastet“, „Konto gesperrt“ – Zeitdruck statt Prozess.', wenn: 'c3_1b' },
        { art: 'rot', titel: 'Rückruf wird schlechtgeredet', text: 'Echter Support hat kein Problem damit, dass du die offizielle Hotline wählst.', wenn: 'c3_2b' },
        { art: 'info', titel: 'Keine Warnung heißt nichts', text: 'Seit 2026 warnt Teams bei manchen verdächtigen Erstanrufen von außen. Fehlt die Warnung, ist der Anruf trotzdem nicht geprüft – achte selbst auf „Extern“.' },
        { art: 'info', titel: 'Freundlich, kompetent, geduldig', text: 'KI-Sprachagenten führen solche Gespräche heute automatisiert – tausendfach parallel und ohne genervt zu klingen.' }
      ],
      kern: 'Deine IT ruft nicht von außen an, um dir ungefragt Fernzugriff abzuschwatzen – erst recht nicht direkt nach einer Spam-Flut, die sie angeblich „filtern“ will.',
      tipp: 'Fernzugriff nur, wenn DU ein Ticket eröffnet hast und der Kontakt über den bekannten IT-Kanal läuft. Im Zweifel: auflegen und die IT über die Nummer im Intranet anrufen.',
      hacker: { reingelegt: 'Danke für den Zugang! Morgen früh ist euer Netzwerk verschlüsselt.', erwischt: 'Hm. Nach 300 Spam-Mails ist sonst jeder dankbar für Hilfe …' },
      beute: 250000,
      beuteText: '250.000 € Lösegeld',
      schadenBei: 'c3_2a',
      schadenText: 'Über die Remotehilfe war er schon auf deinem Rechner, bevor du aufgelegt hast. Fernzugriff lässt sich nicht zurücknehmen.'
    },

    {
      id: 'c2',
      echt: true,
      kanal: 'telefon',
      geraet: 'phone',
      stimme: 'C4QktxZ39Uccr2xNdFHg', // Johanna
      klang: 'telefon',              // schmalbandig wie eine echte Telefonleitung
      atmo: 'callcenter',
      klingel: 'telefon',
      zeit: 'Montag, 19:12',
      storyTitel: 'Ist das wirklich die Bank?',
      lage: 'Mittags hat der Automat deine Karte geschluckt. Du hast die Bank angerufen und um Rückruf gebeten. Gestern warnte sie noch vor falschen Bankmitarbeitern. Jetzt: eine fremde Nummer.',
      anrufer: { name: '+49 69 2471 5583', zeile: 'Festnetz · Frankfurt am Main', initialen: '?', farbe: '#4F5B78' },
      start: { id: 'c2_0', tts: 'Guten Tag, hier ist Sabine Krüger von der Nordlicht Bank, Kartenservice. Sie hatten heute Mittag bei uns angerufen, weil der Automat Ihre Karte eingezogen hat, und um einen Rückruf gebeten. Passt es gerade kurz? [pause]' },
      runden: [
        [
          { text: 'Ja, passt. Ist die neue Karte schon unterwegs?', wert: 'neutral',
            antwort: { id: 'c2_1a', tts: 'Ja, die Ersatzkarte ist heute rausgegangen. Sie sollte in drei bis fünf Werktagen bei Ihnen sein, die PIN kommt wie immer separat per Post. Ihre alte Karte ist gesperrt, da kann also nichts passieren. [pause]' } },
          { text: 'Woher weiß ich, dass Sie wirklich von der Bank sind?', wert: 'gut',
            antwort: { id: 'c2_1b', tts: '[warmly] Gute Frage – genau richtig, dass Sie das fragen! Sie können gern auflegen und uns über die Nummer auf der Rückseite Ihrer Karte oder auf unserer Website zurückrufen. Kurz zur Info: Ihre Ersatzkarte ist heute rausgegangen, und die alte ist gesperrt. [pause]' } }
        ],
        [
          { text: 'Muss ich zur Freischaltung noch etwas bestätigen – PIN oder TAN?', wert: 'gut',
            antwort: { id: 'c2_2a', tts: '[surprised] Nein, auf keinen Fall! PIN und TAN fragen wir niemals ab – weder am Telefon noch per Mail. Wenn das jemals jemand von Ihnen will, legen Sie bitte sofort auf. Ansonsten: Einen schönen Tag noch! [pause]' } },
          { text: 'Super, danke. Dann warte ich auf die Post.', wert: 'neutral',
            antwort: { id: 'c2_2b', tts: 'Sehr gerne. Und falls die Karte bis nächste Woche nicht da ist, melden Sie sich einfach über die Hotline. Einen schönen Tag noch! [pause]' } }
        ]
      ],
      signale: [
        { art: 'gruen', titel: 'Du hast den Rückruf angefordert', text: 'Anlass und Zeitpunkt passen genau zu dem, was du selbst ausgelöst hast.' },
        { art: 'gruen', titel: 'Sie verlangt nichts', text: 'Keine PIN, keine TAN, keine Freigabe in der App, kein Geld. Sie gibt nur Informationen.' },
        { art: 'gruen', titel: 'Rückruf ausdrücklich erwünscht', text: 'Sie bietet von sich aus an, dass du über die offizielle Nummer zurückrufst.', wenn: 'c2_1b' },
        { art: 'gruen', titel: 'PIN und TAN tabu', text: 'Auf deine Frage kam sofort: niemals am Telefon. Ein Betrüger hätte zugegriffen.', wenn: 'c2_2a' },
        { art: 'gruen', titel: 'Kein Druck', text: 'Ruhiger Ton, keine Drohung, kein „sofort“. Die Geräusche im Hintergrund passen zum Kartenservice.' },
        { art: 'info', titel: 'Fremde Nummer, alte Warnung', text: 'Callcenter rufen oft von Sammelnummern an, und Warnungen kommen ständig. Beides beweist nichts – weder für noch gegen den Anruf. Umgekehrt lässt sich auch eine bekannte Nummer fälschen (Call-ID-Spoofing).' }
      ],
      kern: 'Du hast den Rückruf selbst angefordert – und sie wollte nichts von dir. Eine fremde Nummer allein macht noch keinen Fake.',
      tipp: 'Echte Bankmitarbeitende fragen nie nach PIN, TAN oder Freigaben in der App. Im Zweifel: auflegen und die Nummer von der Kartenrückseite wählen.',
      hacker: { echt: 'Gähn. Das war wirklich nur die Bank.', fehlalarm: 'Hehe – jetzt traust du nicht mal mehr deiner Bank. Misstrauen macht müde …' },
      beute: 0
    },

    {
      id: 'c4',
      echt: true,
      kanal: 'teams',
      geraet: 'teams',
      extern: false,
      stimme: 'NE7AIW5DoJ7lUosXV2KR', // Ela
      klang: 'teams',
      atmo: 'homeoffice',
      klingel: 'teams',
      zeit: 'Mittwoch, 17:05',
      storyTitel: 'Lena braucht die Folie – jetzt noch?',
      lage: 'Morgen präsentiert euer Team die Quartalszahlen. Lena aus dem Vertrieb macht laut Weekly die Folien fertig. Kurz nach fünf klingelt Teams.',
      anrufer: { name: 'Lena Hofmann', zeile: 'Vertrieb · Verfügbar', initialen: 'LH', farbe: '#C2477E' },
      start: { id: 'c4_0', tts: 'Hey! [laughs] Sorry, dass ich so spät noch störe. Du, ich sitz grad an der Präsentation für morgen und finde die Folie mit den Kundenzahlen nicht mehr. Hast du die noch? Die war, glaub ich, in deiner Version vom Montag. [pause]' },
      runden: [
        [
          { text: 'Klar, ich schick sie dir gleich.', wert: 'neutral',
            antwort: { id: 'c4_1a', tts: 'Oh, super, danke! Leg sie am besten einfach in unseren Team-Ordner, dann haben alle die aktuelle Version. Ich guck dann gleich rein. [pause]' } },
          { text: 'Wofür genau brauchst du die? Das sind ja interne Zahlen.', wert: 'gut',
            antwort: { id: 'c4_1b', tts: '[laughs] Ja klar, gute Frage! Für die Präsentation morgen beim Vorstand – die Folie zum dritten Quartal, die wir im Weekly besprochen haben. Leg sie einfach in unseren Team-Ordner, da kommen alle dran. [pause]' } }
        ],
        [
          { text: 'Ich ruf dich gleich zurück, ich muss kurz was checken.', wert: 'gut',
            antwort: { id: 'c4_2a', tts: 'Klar, kein Stress! Ich bin noch ’ne Stunde online. Bis gleich! [pause]' } },
          { text: 'Mach ich. Soll ich noch was anpassen?', wert: 'neutral',
            antwort: { id: 'c4_2b', tts: 'Nee, alles gut, den Rest mach ich. Danke dir, du rettest mir echt den Abend! [laughs] Bis morgen! [pause]' } }
        ]
      ],
      signale: [
        { art: 'gruen', titel: 'Interner Kontakt', text: 'Kein „Extern“-Hinweis, bekannter Name, bekanntes Profil im Firmen-Teams.' },
        { art: 'gruen', titel: 'Der Anlass passt', text: 'Ihr habt im Weekly darüber gesprochen, die Präsentation ist morgen.' },
        { art: 'gruen', titel: 'Der normale Weg', text: 'Sie will die Datei im gemeinsamen Team-Ordner – nicht an eine private Mailadresse.' },
        { art: 'gruen', titel: 'Kein Druck, keine Geheimnisse', text: 'Nachfragen und Rückruf sind für sie völlig okay.', wenn: 'c4_2a' },
        { art: 'gruen', titel: 'Kein Druck, keine Geheimnisse', text: 'Keine Eile, kein „sag niemandem was“. Sie geht entspannt auf dich ein.', wennNicht: 'c4_2a' },
        { art: 'info', titel: 'Lachen ist kein Beweis', text: 'Auch KI-Stimmen lachen und sagen „äh“. Entscheidend ist, dass die Bitte plausibel und harmlos ist.' }
      ],
      kern: 'Interner Kontakt, bekannter Anlass, der normale Weg über den Team-Ordner – und Nachfragen waren kein Problem.',
      tipp: 'Auch bei Kolleginnen und Kollegen gilt: Wird es ungewöhnlich – Geld, Passwörter, vertrauliche Daten an fremde Adressen –, dann prüfen. Hier war es das nicht.',
      hacker: { echt: 'Langweilig. Das war wirklich nur Lena.', fehlalarm: 'Jetzt misstraust du schon deiner eigenen Kollegin. Genau das will ich.' },
      beute: 0
    },

    {
      // Gegenstück zum falschen Helpdesk (c3): gleicher Kanal, aber intern, mit eigenem Ticket und ohne Druck
      id: 'c7',
      echt: true,
      kanal: 'teams',
      geraet: 'teams',
      extern: false,
      stimme: 'd9Ln92LAVKPJLW7vlW1m', // Michael
      klang: 'teams',
      atmo: 'helpdesk',
      klingel: 'teams',
      zeit: 'Freitag, 13:20',
      storyTitel: 'Die IT meldet sich – wirklich?',
      lage: 'Seit gestern stürzt Excel bei dir beim Speichern ab. Heute Morgen hast du im IT-Portal ein Ticket aufgemacht. Nach der Mittagspause klingelt Teams.',
      anrufer: { name: 'Tobias Brandt', zeile: 'IT-Service · Verfügbar', initialen: 'TB', farbe: '#2E7D6B' },
      posteingang: [
        ['IT-Service', 'Ticket 48213 angelegt: Excel stürzt beim Speichern ab'],
        ['Lena Hofmann', 'Danke nochmal für die Folie!'],
        ['Kalender', 'Teammeeting · Mo 9:30']
      ],
      start: { id: 'c7_0', tts: 'Hallo, hier ist Tobias Brandt vom IT-Service. Ich rufe wegen Ihres Tickets von heute Morgen an – Excel stürzt bei Ihnen beim Speichern ab, richtig? Haben Sie gerade fünf Minuten? Dann schauen wir uns das kurz zusammen an. [pause]' },
      runden: [
        [
          { text: 'Ja, passt. Was soll ich machen?', wert: 'neutral',
            antwort: { id: 'c7_1a', tts: 'Super. Schließen Sie Excel bitte einmal komplett. Dann halten Sie die Steuerungstaste gedrückt und starten Excel neu – es fragt dann, ob es im abgesicherten Modus starten soll. Klicken Sie auf „Ja“. Wenn es so stabil läuft, ist nur ein Add-in schuld – das schalte ich dann zentral für Sie ab. [pause]' } },
          { text: 'Moment – wie lautet denn meine Ticketnummer?', wert: 'gut',
            antwort: { id: 'c7_1b', tts: '[laughs] Gute Frage, richtig so! Vier, acht, zwei, eins, drei – aufgemacht heute um acht Uhr zwölf: „Excel stürzt beim Speichern ab“. Im IT-Portal steht auch mein Name als Bearbeiter drin. [pause]' } }
        ],
        [
          { text: 'Brauchen Sie dafür noch mein Passwort?', wert: 'gut',
            antwort: { id: 'c7_2a', tts: '[surprised] Nein, auf keinen Fall! Ihr Passwort brauchen wir nie – das geben Sie bitte auch sonst niemandem am Telefon. Ich schalte das Add-in zentral ab und schreibe alles ins Ticket. Schönen Tag noch! [pause]' } },
          { text: 'Ich rufe lieber selbst über die IT-Hotline zurück.', wert: 'gut',
            antwort: { id: 'c7_2b', tts: 'Klar, gar kein Problem! Die Nummer der Hotline steht im Intranet. Nennen Sie einfach die Ticketnummer, dann landen Sie wieder bei mir. Bis gleich! [pause]' } }
        ]
      ],
      signale: [
        { art: 'gruen', titel: 'Dein eigenes Ticket', text: 'Anlass und Zeitpunkt passen genau zu dem Problem, das du heute Morgen selbst gemeldet hast.' },
        { art: 'gruen', titel: 'Interner Kontakt', text: 'Kein „Extern“-Hinweis: Er ruft aus dem Firmen-Teams an, mit Namen und Abteilung.' },
        { art: 'gruen', titel: 'Du machst es selbst', text: 'Keine Remotehilfe, kein Code: Du startest Excel selbst neu, er erklärt nur.', wenn: 'c7_1a' },
        { art: 'gruen', titel: 'Ticketnummer stimmt', text: 'Er nennt Nummer, Uhrzeit und Problem – und verweist aufs Portal, wo du alles selbst prüfen kannst.', wenn: 'c7_1b' },
        { art: 'gruen', titel: 'Passwort tabu', text: 'Auf deine Frage kam sofort: niemals. Ein Betrüger hätte zugegriffen.', wenn: 'c7_2a' },
        { art: 'gruen', titel: 'Rückruf erwünscht', text: 'Er verweist auf die Hotline aus dem Intranet – nicht auf eine Nummer, die er dir selbst nennt.', wenn: 'c7_2b' },
        { art: 'info', titel: 'Gleicher Kanal wie der Fake', text: 'Auch der falsche Helpdesk rief über Teams an. Den Unterschied machen „Extern“, dein eigenes Ticket – und ob du selbst nachprüfen darfst.' }
      ],
      kern: 'Dein eigenes Ticket, ein interner Kontakt, kein Passwort, kein Fernzugriff – und Nachprüfen ausdrücklich erwünscht. So klingt echter IT-Support.',
      tipp: 'Echte IT fragt nie nach deinem Passwort oder einem MFA-Code. Ruft sie an: Ticketnummer nennen lassen und im Portal prüfen – oder selbst über die Hotline aus dem Intranet zurückrufen.',
      hacker: { echt: 'Gähn. Das war wirklich nur die IT.', fehlalarm: 'Jetzt traust du nicht mal mehr deiner eigenen IT. Viel Spaß mit dem kaputten Excel!' },
      beute: 0
    },

    {
      // CEO-Fraud mit Stimmklon. Die Aufnahmen stammen aus dem früheren Videoanruf; c5_2b endet mit einem Verbindungsabbruch.
      id: 'c5',
      echt: false,
      kanal: 'whatsapp',
      geraet: 'phone',
      stimme: '1iF3vHdwHKuVKSPDK23Z', // Louisa
      klang: 'messenger',
      atmo: null,
      klingel: 'messenger',
      zeit: 'Donnerstag, 16:52',
      storyTitel: 'Die Chefin persönlich – am Handy?',
      lage: 'Du vertrittst deine Teamleitung und darfst Zahlungen freigeben. Die Chefin, Dr. Katrin Albers, kennst du aus Townhall-Videos. Jetzt: ein WhatsApp-Anruf mit ihrem Foto – von einer fremden Nummer.',
      anrufer: { name: '+49 157 3308 1146', zeile: 'WhatsApp-Audio · ~Katrin Albers', initialen: 'KA', farbe: '#8A6A3C', foto: 'assets/albers-profil.jpg' },
      start: { id: 'c5_0', tts: 'Hallo! Gut, dass ich Sie erreiche. Katrin Albers hier. Ich sitze gerade in Zürich zwischen zwei Terminen, deshalb rufe ich vom privaten Handy an. Es geht um etwas sehr Vertrauliches: Wir stehen kurz vor einer Übernahme. Das darf noch niemand wissen, wirklich niemand. Ich brauche heute noch eine Anzahlung von achtundvierzigtausendfünfhundert Euro an die Kanzlei. Können Sie das für mich anstoßen? [pause]' },
      runden: [
        [
          { text: 'Natürlich. Wohin soll das Geld gehen?', wert: 'riskant',
            antwort: { id: 'c5_1a', tts: 'Wunderbar, ich wusste, dass ich mich auf Sie verlassen kann. Die Kanzlei schickt Ihnen gleich die Kontodaten per Mail. Bitte als Eilüberweisung, heute noch – und nicht über die normale Freigabe, sonst ist es morgen im ganzen Haus rum. [pause]' } },
          { text: 'Ich rufe Sie kurz auf Ihrer Büronummer zurück.', wert: 'gut',
            antwort: { id: 'c5_1b', tts: '[impatient] Dafür ist jetzt wirklich keine Zeit, ich gehe gleich in den nächsten Termin. Die Kanzlei schickt Ihnen gleich die Kontodaten. Bitte heute noch, und bitte diskret. [pause]' } }
        ],
        [
          { text: 'In Ordnung, ich kümmere mich darum.', wert: 'riskant',
            antwort: { id: 'c5_2a', tts: 'Danke. Ich verlasse mich auf Sie. Und denken Sie dran: Kein Wort zu niemandem. Bis dann. [pause]' } },
          { text: 'Vorher kurz: Wie heißt das Projekt, das Sie mir letzte Woche übergeben haben?', wert: 'gut',
            antwort: { id: 'c5_2b', tts: '[annoyed] Wie bitte? Was soll das denn jetzt? Ich habe wirklich keine Zeit für so etwas… Die Verbindung hier ist furchtbar, ich… [pause]', glitch: true } }
        ]
      ],
      signale: [
        { art: 'rot', titel: 'Fremde Nummer, vertraute Stimme', text: 'Ein Profilfoto kann jeder hochladen. Und Townhall-Videos liefern genug Material für einen Stimmklon.' },
        { art: 'rot', titel: 'Geheimhaltung', text: '„Das darf niemand wissen“, „nicht über die normale Freigabe“ – damit soll niemand gegenprüfen.' },
        { art: 'rot', titel: 'Zeitdruck und Autorität', text: 'Die Chefin persönlich, „heute noch“, „Eilüberweisung“. Wer widerspricht da schon?' },
        { art: 'rot', titel: 'Rückruf abgeblockt', text: 'Ein Rückruf über die Büronummer dauert eine Minute. Wer ihn mit Zeitdruck abblockt, will genau diese Prüfung verhindern.', wenn: 'c5_1b' },
        { art: 'rot', titel: 'Kontrollfrage? Leitung tot.', text: 'Statt einer Antwort kam Ärger – und dann brach die Verbindung ab. Wer eine einfache Frage zum gemeinsamen Alltag nicht beantworten kann, ist nicht die, die sie vorgibt zu sein.', wenn: 'c5_2b' },
        { art: 'info', titel: 'Die Stimme ist KI', text: 'Diese Chefin gibt es nicht: Die Stimme ist komplett KI-erzeugt. Für einen echten Klon reichen ein paar Minuten aus einem Townhall-Video.' }
      ],
      kern: 'Geheim, eilig, am Prozess vorbei – und der Rückruf wird abgeblockt. Auch eine vertraute Stimme beweist nichts.',
      tipp: 'Zahlungen laufen nie am Prozess vorbei – egal, wer anruft. Auflegen, über die bekannte Nummer zurückrufen, Vier-Augen-Prinzip einhalten.',
      hacker: { reingelegt: '48.500 €. Und ich hab nur ihre Stimme gebraucht.', erwischt: 'Perfekte Stimme, perfekte Geschichte – und trotzdem durchschaut. Respekt.' },
      beute: 48500,
      beuteText: '48.500 € Anzahlung'
    }
  ],

  /* ---------------- Levels ----------------
     anzahl = so viele Anrufe aus der Liste oben, der Reihe nach.
     Nach Level 1 kommt der Sicherheitstipp (unten). */
  levels: [
    { anzahl: 3, kicker: 'Hör genau hin – und hak nach.' },
    { anzahl: 3, kicker: 'Anrufe im Job – wem kannst du trauen?' }
  ],
  levelIntro: {
    kicker: 'Level {n} von {gesamt}',
    titel: 'Bereit für Level {n}?',
    anrufe: 'Anrufe',
    los: 'Los geht’s'
  },
  levelEnde: {
    kicker: 'Level {n} von {gesamt} · Auswertung',
    perfekt: 'Perfekt! Kein Fake kam durch.',
    gut: 'Level {n} geschafft!',
    knapp: 'Da geht noch mehr.',
    richtig: '{richtig} von {gesamt} richtig erkannt',
    beute: 'Hacker-Beute in diesem Level',
    beuteNull: 'Der Hacker ging leer aus.',
    details: 'Deine Anrufe',
    warFake: 'KI-Fake',
    warEcht: 'Echt',
    zumTipp: 'Weiter zum Sicherheitstipp',
    naechstesLevel: 'Weiter zu Level {n}',
    zumErgebnis: 'Zur Auswertung'
  },

  /* ---------------- Sicherheitstipp nach Level 1: kleines Vishing-Nugget ----------------
     Erst die Lehren aus den Feedbacks der ersten Anrufe (karten, eine nach der anderen),
     dann die Frage mit den vier Optionen und die Rückruf-Regel. Der letzte Knopf kommt aus levelEnde. */
  pause: {
    kicker: 'Sicherheitstipp · Vishing',
    titel: 'Vishing: Betrug am Telefon',
    lead: 'Vishing heißt Voice-Phishing: Betrüger rufen an, statt zu mailen – immer öfter mit KI-Stimmen. Das sind die wichtigsten Lehren aus deinen ersten Anrufen.',
    karten: [
      { icon: 'welle', farbe: '#FF2D87', titel: 'Die Stimme ist kein Beweis',
        text: 'Ein paar Sekunden Audio – etwa aus Videos in sozialen Netzwerken – reichen für einen Stimmklon. Ob ein Anruf echt ist, kannst du nicht hören.',
        beispiel: 'Jonas klang wie Jonas – und war doch eine KI.' },
      { icon: 'display', farbe: '#2BB8E8', titel: 'Die Nummer ist kein Beweis',
        text: 'Angezeigte Nummern lassen sich fälschen. Und umgekehrt: Eine fremde Nummer allein macht noch keinen Fake.',
        beispiel: 'Die Bank rief von einer fremden Nummer an – und war echt.' },
      { icon: 'warnung', farbe: '#FFC24D', titel: 'Erkenne das Muster',
        text: 'Zeitdruck, Angst oder Geheimhaltung plus eine ungewöhnliche Bitte: Geld, PIN oder TAN, Passwörter, Fernzugriff. Das gilt auch, wenn scheinbar Kollegen oder die Chefin anrufen.',
        beispiel: 'Der „IT-Helpdesk“ wollte ohne Ticket auf deinen Rechner.' },
      { icon: 'frage', farbe: '#17FFC0', titel: 'Hak nach – und prüf den Weg',
        text: 'Kontrollfrage, Ticketnummer, der normale Prozess: Echte Anrufer gehen darauf ein. Betrüger weichen aus, machen Druck – oder rufen von außen an, wo intern üblich wäre.',
        beispiel: '„Extern“ im Teams-Anruf? Deine IT sitzt im eigenen Haus.' }
    ],
    lehre: 'Lehre {n} von {gesamt}',
    beispiel: 'Aus deinen Anrufen',
    weiter: 'Weiter',
    zurueck: 'Zurück',
    zurFrage: 'Und jetzt du',
    frageTitel: 'Und wenn du dir nicht sicher bist?',
    szene: 'Dein Telefon klingelt. Die Stimme klingt genau wie deine Chefin. Sie bittet dich um etwas Ungewöhnliches – und es eilt. Irgendetwas fühlt sich komisch an.',
    frage: 'Was tust du?',
    optionen: [
      { icon: 'frage', farbe: '#9B7BFF', text: 'Ich stelle eine Kontrollfrage, die nur sie beantworten kann.', wert: 'halb',
        titel: 'Guter Instinkt – aber nur die halbe Miete.',
        erklaerung: 'Eine Kontrollfrage kann einen Fake entlarven: 2024 stoppten Manager bei Ferrari einen Deepfake ihres CEO, weil der Anrufer nicht wusste, welches Buch der Chef kürzlich empfohlen hatte. Aber vieles steht im Netz – und manche Fragen lassen sich erraten. Am sichersten ist der Rückruf.' },
      { icon: 'kamera', farbe: '#2BB8E8', text: 'Ich bitte um einen Videoanruf – dann sehe ich, ob sie es wirklich ist.', wert: 'falsch',
        titel: 'Leider nein.',
        erklaerung: 'Auch Gesichter lassen sich live fälschen. 2024 überwies ein Mitarbeiter des Ingenieurbüros Arup 25 Millionen Dollar – nach einer Videokonferenz, in der alle anderen Teilnehmenden Deepfakes waren.' },
      { icon: 'rueckruf', farbe: '#FFC24D', text: 'Ich lege auf und rufe sie über die Nummer an, die ich kenne.', wert: 'voll',
        titel: 'Genau richtig!',
        erklaerung: 'Der Rückruf über einen bekannten Weg ist der stärkste Schutz – gegen jede noch so gute Stimme und jedes noch so echte Gesicht. Echte Kolleginnen und Kollegen verstehen das.' },
      { icon: 'display', farbe: '#FF8A5B', text: 'Ich rufe die Nummer zurück, die im Display stand.', wert: 'falsch',
        titel: 'Vorsicht!',
        erklaerung: 'Die angezeigte Nummer lässt sich fälschen (Call-ID-Spoofing) – und eine echte Rückrufnummer kann trotzdem dem Betrüger gehören. Nutze nur Nummern, die du selbst kennst: Adressbuch, Intranet, Website, Kartenrückseite.' }
    ],
    regel: {
      titel: 'Die Rückruf-Regel',
      punkte: [
        { icon: 'phone-off', titel: 'Auflegen ist nicht unhöflich', text: 'Bei ungewöhnlichen Bitten darfst du das Gespräch jederzeit beenden.' },
        { icon: 'phone-out', titel: 'Selbst zurückrufen', text: 'Über eine Nummer, die DU kennst – nicht die im Display und nicht die aus dem Gespräch.' },
        { icon: 'key', titel: 'Codewort vereinbaren', text: 'In der Familie und im Team – für Notfälle und ungewöhnliche Anweisungen.' }
      ]
    }
  },

  /* ---------------- Auswertung ---------------- */
  auswertung: {
    titel: 'Auswertung',
    // fehler = höchstens so viele falsch erkannte Anrufe (der erste passende Rang gilt)
    raenge: [
      { fehler: 0, titel: 'Deepfake-Detektiv:in', text: 'Alle Anrufe richtig erkannt. Dich legt so schnell keine KI rein.' },
      { fehler: 1, titel: 'Scharfes Gehör', text: 'Fast perfekt. Ein Anruf hat dich erwischt – schau dir an, welcher.' },
      { fehler: 2, titel: 'Wachsam – mit Lücken', text: 'Du bist auf dem richtigen Weg. Achte noch mehr auf das Muster hinter den Anrufen.' },
      { fehler: 99, titel: 'Leichte Beute', text: 'Die KI hatte heute leichtes Spiel. Aber jetzt kennst du ihre Tricks.' }
    ],
    richtig: 'richtig erkannt',
    beuteNull: 'Der Hacker geht leer aus.',
    beuteVoll: 'hat der Hacker heute erbeutet.',
    hackerGut: 'Ganz ehrlich? Mit dir macht das keinen Spaß.',
    hackerMittel: 'Nicht schlecht. Aber einmal hab ich dich.',
    hackerSchlecht: 'Danke für die Spende! Bis zum nächsten Anruf …',
    akte: 'Deine Anrufe',
    regelnTitel: 'Deine 4 Regeln gegen Vishing & Deepfakes',
    regeln: [
      { titel: 'Stimme und Gesicht sind kein Beweis', text: 'Ein paar Sekunden Audio oder ein Foto reichen für einen überzeugenden Klon.' },
      { titel: 'Erkenne das Muster', text: 'Zeitdruck + Geheimhaltung + ungewöhnliche Bitte: Geld, Codes, Zugangsdaten, Fernzugriff.' },
      { titel: 'Hak nach', text: 'Kontrollfrage, Ticketnummer, normaler Prozess. Betrüger weichen aus und machen Druck – echte Anrufer nicht.' },
      { titel: 'Auflegen & zurückrufen', text: 'Über eine Nummer, die du kennst. Und vereinbart ein Codewort – privat und im Team.' }
    ],
    nachgehakt: 'mal nachgehakt',
    nochmal: 'Nochmal spielen',
    kleingedruckt: 'Alle Stimmen und Bilder in dieser Challenge wurden mit KI erzeugt – auch die der echten Anrufer.',
    quellen: 'Hintergrund: Lagebilder von Polizei und Verbraucherzentralen zu KI-Schockanrufen, Sicherheitsberichte zu Teams-Vishing (2026) sowie die bekannten Fälle eines britischen Energieversorgers (2019), Arup (2024) und Ferrari (2024).'
  }
};
