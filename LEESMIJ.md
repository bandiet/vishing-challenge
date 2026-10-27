# Vishing Challenge — audio-vishingquiz in het serieformat (CCT)

Doorontwikkeling van `../../Vishing - Deepfake or not/MenschOderKI2` (die blijft daar ongewijzigd staan). Zelfde look als de **Phishing Challenge 2.0**: kleuren, systeemlettertype, pilknoppen, kaarten, HUD, sterrenvlucht op de start, level-start ("Bereit für Level X?"), level-auswertung met halve-cirkelmeter en een eindscherm in dezelfde stijl. Geen jokers en geen streaks: de enige score is de **buit van de hacker** (hoe minder, hoe beter). Alleen nog audiogesprekken, geen video.

## Verloop

Start (titel, golf Echt→Fake, vliegende symbolen) → "Bereit für Level 1?" → intro (stemkloon-werkbank, eindigt met "Gleich klingelt dein Telefon.") → **Level 1** (c1 Jonas, c3 nep-helpdesk, c2 bank) → level-auswertung → **Sicherheitstipp "Vishing erkennen"**: drie lessen uit de eerste gesprekken, één per kaart met een beeld (introtekst op kaart 1, het patroon als lijst op kaart 3) → **Level 2** (c4 Lena, c7 echte IT-terugbelactie, c5 Chefin per WhatsApp-audio) → level-auswertung → **Zum Schluss**: de tipkaart "Hak nach – und prüf den Weg", dan de vraag "Und wenn du dir nicht sicher bist?" en de Rückruf-Regel → eindauswertung.

De nugget-beelden (`assets/nugget-*.webp`) zijn met ElevenLabs gemaakt in de stijl van de Phishing Challenge-nuggets (flow "Vishing Challenge – Nugget-Bilder"). De niet gekozen varianten en de ontwerpvergelijking voor het transcript staan lokaal in `entwurf/`. Git negeert die map.

Gesprekscherm: links het toestel (telefoon of Teams) met het transcript ernaast (bij Teams eronder), rechts de situatie, de antwoorden en het oordeel. Live-ondertitels staan standaard **uit** ("… spricht …"). De schakelaar "Live-Untertitel" zet ze aan en uit; wie het geluid uitzet, krijgt ze automatisch aan. Oordeel ECHT (mint, schild met vinkje) / FAKE (koraal, hoorn met uitroepteken).

Bij gesprek c3 is het postvak eerst leeg en loopt het dan langzaam vol, tot het venster vol is.

Feedback staat, net als in de Phishing Challenge, in het paneel rechts (in plaats van situatie en antwoorden). Op smalle schermen staat het transcript erboven. Eerst het resultaat ("Entlarvt!", "Getäuscht!", …), de algemene terugkoppeling en "Das Entscheidende". Intussen vliegt de SVG-hacker uit Opus even van links binnen met een sprechblase: blij als hij gewonnen heeft, geschrokken als hij door de mand viel, gapend bij een echt gesprek. Daarna volgen "Details anzeigen" en "Hinweise überspringen". "Details anzeigen" loopt de signalen één voor één door, met als laatste "Das schützt dich". Per gesprek zijn dat maximaal 4 stappen: de eerste drie signalen die bij het gespreksverloop passen (`signale` staan op volgorde van belang), plus "Das schützt dich". Elk signaal kan een `zitat` hebben. Bij die hinweis licht de passage in het transcript op, zoals de spotlight in de Phishing Challenge. Het citaat moet letterlijk in de ondertitel staan. Als de hacker buit maakt, telt de kas in de HUD mee op. Een klik op die kas haalt de hacker erbij met een zin over zijn buit (`hackerKasse` in `content.js`; vóór het eerste gesprek: "wacht maar af").

## Starten

`python3 serve.py 8814` (launch-config `vishingchallenge`). Testsprongen: `#intro`, `#l1`, `#l2`, `#anruf1` … `#anruf6`, `#e1`, `#e2`, `#pause` (nugget), `#schluss` (tipkaart), `#frage` (slotvraag), `#ende`.

## Bestanden

| Bestand | Inhoud |
|---|---|
| `js/content.js` | alle teksten; `anrufe` in speelvolgorde, `feedback` (titels en terugkoppeling in het paneel), `hackerKasse` (zinnen bij een klik op de buit), `levels` (aantal gesprekken per level), `levelIntro`, `levelEnde`, `pause` (nugget-kaarten), `schluss` (tipkaart, vraag en Rückruf-Regel) |
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
