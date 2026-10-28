# Vishing Challenge — audio-vishingquiz in het serieformat (CCT)

Doorontwikkeling van `../../Vishing - Deepfake or not/MenschOderKI2` (die blijft daar ongewijzigd staan). Zelfde look als de **Phishing Challenge 2.0**: kleuren, systeemlettertype, pilknoppen, kaarten, HUD, sterrenvlucht op de start, level-start ("Bereit für Level X?"), level-auswertung met halve-cirkelmeter en een eindscherm in dezelfde stijl. Geen jokers en geen streaks: de enige score is de **buit van de hacker** (hoe minder, hoe beter). Alleen nog audiogesprekken, geen video.

## Verloop

Start (titel, golf Echt→Fake, vliegende symbolen) → "Bereit für Level 1?" → intro (stemkloon-werkbank, eindigt met "Gleich klingelt dein Telefon.") → **Level 1** (c1 Jonas, c3 nep-helpdesk, c2 bank) → level-auswertung → **Sicherheitstipp "Vishing erkennen"**: drie lessen uit de eerste gesprekken, één per kaart met een beeld (introtekst op kaart 1, het patroon als lijst op kaart 3) → **Level 2** (c4 Lena, c7 echte IT-terugbelactie, c5 Chefin per WhatsApp-audio) → level-auswertung → **Zum Schluss**: de tipkaart "Hak nach – und prüf den Weg", dan de vraag "Und wenn du dir nicht sicher bist?" (de Rückruf-Regel staat in dezelfde feedbackbox als het antwoord) → eindauswertung. De knoppen onderaan de vraag en de eindauswertung blijven onderaan staan, net als in de nugget.

**Minimaal 2 van 3 per level** (`levels[].mindestens` in `content.js`). Wie minder goed heeft, ziet "Noch nicht geschafft." met een streepje bij 67 % op de meter en speelt het level opnieuw ("Level 1 wiederholen"). De uitslagen en de buit van die poging vervallen; de intro komt niet nog een keer. De level-start toont het doel als tweede chip ("2 richtig zum Bestehen").

De nugget-beelden (`assets/nugget-*.webp`) zijn met ElevenLabs gemaakt in de stijl van de Phishing Challenge-nuggets (flow "Vishing Challenge – Nugget-Bilder"). De niet gekozen varianten en de ontwerpvergelijking voor het transcript staan lokaal in `entwurf/`. Git negeert die map.

Gesprekscherm: links het toestel (telefoon of Teams), gecentreerd. Rechts staan de situatie, het transcript, direct daaronder de antwoorden, en daarna het oordeel. Live-ondertitels staan standaard **uit**. Het transcript is dan één smalle balk met de schakelaar "Live-Untertitel" en "Nochmal hören", zonder tekst en zonder je eigen keuzes. Wie het geluid uitzet, krijgt de ondertitels automatisch aan. Het oordeel is "Was steckt hinter diesem Anruf?" met de knoppen ECHT (mint, schild met vinkje) en VISHING (koraal, hoorn met uitroepteken). Ophangen kan alleen met de knop, niet met Escape: die toets sloot vroeger per ongeluk gesprekken af bij het wisselen van venster of volledig scherm.

Onder 960 px breed of 540 px hoog staat alles onder elkaar, zoals op mobiel. De telefoon houdt op elk formaat zijn verhouding.

Vóór een Teams-gesprek toont het venster een mailprogramma. In de titelbalk staan het menu-symbool met "Mail", de zoekbalk, een bel, instellingen en een profielfoto. Links staat een app-balk (mail, agenda, personen, chat, bestanden). Bovenaan een werkbalk met "Neue E-Mail" en onopvallende symbolen: verwijderen, archiveren, melden, verplaatsen, beantwoorden, doorsturen, markeren. Daaronder de mappen, de lijst (kürzel, afzender, tijd, onderwerp; ongelezen vet met een balk links) en rechts het leesvenster: de bovenste mail staat open, de tekst als grijze regels. Hoe smaller het venster, hoe meer er wegvalt: eerst het leesvenster, dan de mappen, dan de app-balk. Bij gesprek c3 is het postvak eerst leeg en loopt het dan langzaam vol, tot het venster vol is; het leesvenster zegt dan "Element zum Lesen auswählen". De antwoordopties tijdens het gesprek zijn paars, zoals je eigen tekstballonnen in het transcript, zodat ze zich onderscheiden van de ondertitels. Verschijnen de antwoorden of het oordeel onder het transcript, dan scrolt het transcript mee naar de laatste regel.

Feedback staat, net als in de Phishing Challenge, in het paneel rechts (in plaats van situatie en antwoorden). Bij "Details anzeigen" schuift het transcript naar links: de telefoon schuift opzij en het gespreksverloop staat ernaast, ook als de ondertitels uit stonden. Bij Teams schuift het venster helemaal naar boven, gelijk met het paneel rechts, en neemt het hooguit de helft van de hoogte; het transcript eronder is even breed en loopt door tot onderaan. Tussen 960 en 1100 px breed en op mobiel valt het toestel dan weg en staat alleen het transcript links (mobiel: erboven). Eerst het resultaat ("Entlarvt!", "Getäuscht!", …), de algemene terugkoppeling en "Das Entscheidende". Intussen vliegt de SVG-hacker uit Opus even van links binnen met een sprechblase (niet bij elk gesprek: altijd bij het eerste, daarna willekeurig, samen bij ongeveer 4 van de 6): blij als hij gewonnen heeft, geschrokken als hij door de mand viel, gapend bij een echt gesprek. Daarna volgen "Details anzeigen" en "Hinweise überspringen". "Details anzeigen" loopt de signalen één voor één door, met als laatste "Das schützt dich". Per gesprek zijn dat maximaal 4 stappen: de eerste drie signalen die bij het gespreksverloop passen (`signale` staan op volgorde van belang), plus "Das schützt dich". Elk signaal kan een `zitat` hebben. Bij die hinweis licht de passage in het transcript op, zoals de spotlight in de Phishing Challenge. Het citaat moet letterlijk in de ondertitel staan. Een klik op een onderstreepte passage opent de bijbehorende hinweis. Met `geraet` (anrufer, extern, namensschild) licht ook iets op het toestel op, zoals "Extern" in Teams of het onbekende nummer. Als de hacker buit maakt, telt de kas in de HUD mee op. Een klik op die kas haalt de hacker erbij met een zin over zijn buit (`hackerKasse` in `content.js`; vóór het eerste gesprek: "wacht maar af"). Nog een klik stuurt hem weg; de klik daarna haalt hem terug met een andere zin.

## Starten

`python3 serve.py 8814` (launch-config `vishingchallenge`). Testsprongen: `#intro`, `#l1`, `#l2`, `#anruf1` … `#anruf6`, `#e1`, `#e2`, `#pause` (nugget), `#schluss` (tipkaart), `#frage` (slotvraag), `#ende`. Testsprongen melden niets aan het LMS.

## SCORM

`python3 tools/bouw-artifact.py` bouwt naast de website ook `dist/Vishing_Challenge_DE_SCORM2004.zip` en `dist/Vishing_Challenge_DE_SCORM12.zip`. Beide bevatten `imsmanifest.xml`, `index.html` (CSS en JS ingebed) en `assets/` in de root van de zip. Git negeert de zips.

`js/lms.js` (zelfde opzet als in de Phishing Challenge) praat met het LMS:

- Bij de start wordt `cmi.completion_status` `incomplete`; `cmi.exit` is `suspend`.
- Elk oordeel gaat als interaction mee (`c1` … `c7`, antwoord `echt`/`vishing`, correct/incorrect).
- Na elk gehaald level: `cmi.progress_measure` (0.5 en 1). De stand gaat in `suspend_data`: gehaalde levels, hun uitslagen, de buit en of de sicherheitstipp gezien is. Wie het pakket opnieuw opent, ziet "Weiter mit Level 2".
- Pas als **beide levels gehaald** zijn: `completed` + `passed` (1.2: `passed`), score = goed herkende gesprekken van de laatste poging per level (bijv. 4/6 = 67). Een eerder `passed` wordt nooit teruggezet. Het eindscherm meldt "Bestanden! Dein Ergebnis wurde an das LMS übermittelt."
- Het manifest laat het slagen niet over aan de score (geen `satisfiedByMeasure`); het SCO meldt status en succes zelf.
- Zonder LMS (website) doet `lms.js` niets en onthoudt het niets.

Testen zonder LMS: `http://localhost:8814/test/lms.html` (LMS-simulator met SCORM 1.2/2004, schermformaten en een log van alle SCORM-aanroepen; "Neu laden" test het hervatten).

## Bestanden

| Bestand | Inhoud |
|---|---|
| `js/content.js` | alle teksten; `anrufe` in speelvolgorde, `feedback` (titels en terugkoppeling in het paneel), `hackerKasse` (zinnen bij een klik op de buit), `levels` (aantal gesprekken per level), `levelIntro`, `levelEnde`, `pause` (nugget-kaarten), `schluss` (tipkaart, vraag en Rückruf-Regel) |
| `js/app.js` | verloop: start, intro, levels, gesprekken, oordeel, feedback, nugget, level-auswertung (herhalen bij minder dan 2 goed), eindscherm, LMS-stand |
| `js/lms.js` | SCORM 1.2 en 2004 (status, score, interactions, hervatten) |
| `test/lms.html` | LMS-simulator voor lokaal testen |
| `js/klang.js` | Web Audio (muziek, stemmen door de lijnfilters, beltonen, synth-geluiden) |
| `js/feier.js` | confetti (overgenomen uit de Phishing Challenge) |
| `css/style.css` | serielook; telefoon/Teams/ondertitels/feedback/nugget |
| `tools/stimmen.json` | tekst en stem van elke opgenomen regel (ElevenLabs eleven_v3) |
| `tools/haal.py` | haalt klaargezette ElevenLabs-generaties binnen (`stem-nodes.json` koppelt sessie → bestand) |
| `tools/bouw-artifact.py` | bouwt `dist/artifact`, `dist/site` (Cloudflare-worker `vishing-challenge`) en de SCORM-zips |

## Stemmen

- c7 (echte IT, Tobias Brandt): stem "Michael" (`d9Ln92LAVKPJLW7vlW1m`), take 1 van elke regel.
- c5 (Chefin): de bestaande opnames uit de vroegere videocase; bij de kontrollvraag (`c5_2b`) valt de verbinding weg (`glitch: true`).
- Wie een `tts`-tekst in `content.js` wijzigt, moet die regel opnieuw genereren (zelfde bestandsnaam in `assets/stem/`).
