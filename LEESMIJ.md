# Vishing Challenge — audio-vishingquiz in het serieformat (CCT)

Doorontwikkeling van `../../Vishing - Deepfake or not/MenschOderKI2` (die blijft daar ongewijzigd staan). Zelfde look als de **Phishing Challenge 2.0**: kleuren, systeemlettertype, pilknoppen, kaarten, HUD, sterrenvlucht op de start, level-start ("Bereit für Level X?"), level-auswertung met halve-cirkelmeter en een eindscherm in dezelfde stijl. Geen jokers en geen streaks: de enige score is de **buit van de hacker** (hoe minder, hoe beter). Alleen nog audiogesprekken, geen video.

## Verloop

Start (titel, golf Mensch→Maschine, vliegende symbolen) → "Bereit für Level 1?" → intro (stemkloon-werkbank, eindigt met "Gleich klingelt dein Telefon.") → **Level 1** (c1 Jonas, c3 nep-helpdesk, c2 bank) → level-auswertung → **Sicherheitstipp als Vishing-nugget**: vier lessen uit de feedback van de eerste gesprekken, één per kaart, daarna de vraag "Und wenn du dir nicht sicher bist?" en de Rückruf-Regel → **Level 2** (c4 Lena, c7 echte IT-terugbelactie, c5 Chefin per WhatsApp-audio) → level-auswertung → eindauswertung.

Gesprekscherm: links het toestel (telefoon of Teams), rechts de situatie en daaronder het gesprekspaneel. Telefoon en rechterkolom staan verticaal gecentreerd. Live-ondertitels staan standaard **uit** ("… spricht …"); de schakelaar "Live-Untertitel" in het paneel zet ze aan en uit. Oordeel ECHT (mint) / FAKE (koraal).

Feedback staat, net als in de Phishing Challenge, in het paneel rechts (in plaats van situatie en gesprek; op smalle schermen onder het compacte telefoonkaartje). Eerst het resultaat ("Entlarvt!", "Getäuscht!", …), de algemene terugkoppeling en "Das Entscheidende". Intussen vliegt de SVG-hacker uit Opus even van links binnen met een sprechblase: blij als hij gewonnen heeft, geschrokken als hij door de mand viel, gapend bij een echt gesprek. Daarna volgen "Details anzeigen" en "Hinweise überspringen". "Details anzeigen" loopt de signalen één voor één door, met als laatste "Das schützt dich". Als de hacker buit maakt, telt de kas in de HUD mee op. Een klik op die kas haalt de hacker erbij met een zin over zijn buit (`hackerKasse` in `content.js`).

## Starten

`python3 serve.py 8814` (launch-config `vishingchallenge`). Testsprongen: `#intro`, `#l1`, `#l2`, `#anruf1` … `#anruf6`, `#e1`, `#e2`, `#pause`, `#frage`, `#ende`.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `js/content.js` | alle teksten; `anrufe` in speelvolgorde, `feedback` (titels en terugkoppeling in het paneel), `hackerKasse` (zinnen bij een klik op de buit), `levels` (aantal gesprekken per level), `levelIntro`, `levelEnde`, `pause` (nugget-kaarten + vraag) |
| `js/app.js` | verloop: start, intro, levels, gesprekken, oordeel, feedback, nugget, level-auswertung, eindscherm |
| `js/klang.js` | Web Audio (muziek, stemmen door de lijnfilters, beltonen, synth-geluiden) |
| `js/feier.js` | confetti (overgenomen uit de Phishing Challenge) |
| `css/style.css` | serielook; telefoon/Teams/ondertitels/feedback/nugget |
| `tools/stimmen.json` | tekst en stem van elke opgenomen regel (ElevenLabs eleven_v3) |
| `tools/haal.py` | haalt klaargezette ElevenLabs-generaties binnen (`stem-nodes.json` koppelt sessie → bestand) |
| `tools/bouw-artifact.py` | bouwt `dist/artifact` en `dist/site` (Cloudflare-worker `vishing-challenge`) |

## Stemmen

- c7 (echte IT, Tobias Brandt): stem "Michael" (`d9Ln92LAVKPJLW7vlW1m`), take 1 van elke regel.
- c5 (Chefin): de bestaande opnames uit de vroegere videocase; bij de kontrollvraag (`c5_2b`) valt de verbinding weg (`glitch: true`).
- Wie een `tts`-tekst in `content.js` wijzigt, moet die regel opnieuw genereren (zelfde bestandsnaam in `assets/stem/`).
