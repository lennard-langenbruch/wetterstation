# Mobile Wetterstation 

##  [Live-Demo](lennard-langenbruch.github.io/wetterstation)

<img width="1441" height="962" alt="grafik" src="https://github.com/user-attachments/assets/4a3c0b62-be3a-463f-a321-c2fff5a96ec8" />
<p><sub><i>https://lennard-langenbruch.github.io</i></sub></p>

<br>

## Mikrocontroller (MCU)
<img width="832" height="302" alt="grafik" src="https://github.com/user-attachments/assets/e44684ca-1b41-4f40-a3e6-22fdecb24314" />

<p><sub><i>Modell T-SIM7000G der Firma <a href="https://wiki.lilygo.cc/zh/products/t-sim-series/t-sim7000">LILYGO</a></i></sub></p>

<br>

## Kommunikation
<p>Die Wetterstation (MCU) sendet ein JSON-Payload (publish) an den MQTT-Broker.</p>
<p>Eine minimale, separate Adapter-Anwendung (Node.js) wird darüber benachrichtigt (subscribe) und speichert diese Daten in einer relationalen Datenbank (SQLite).</p>
<p>Diese Webanwendung (Next.js) stellt die Daten aus der Datenbank tabellarisch dar und hat ebenfalls ein Abonnement (subscribe) auf denselben MQTT-Broker für die Live-Ansicht.</p>

<img width="768" height="423" alt="grafik" src="https://github.com/user-attachments/assets/31517cd1-e306-46d7-a499-dcf45fc47ffd"/>
<p><sub><i>Diagram created with <a href="https://www.drawio.com">draw.io</a></i></sub></p>

<br>

## Wie die Daten in die Seite kommen

Die Seite liegt auf GitHub Pages und wird dort nur ausgeliefert, es läuft kein Node-Prozess.
Deshalb steht in `next.config.mjs` `output: "export"`, und die Datenbank kann zur Laufzeit nicht
abgefragt werden.

Stattdessen liest `scripts/export-readings.mjs` die Datenbank einmal beim Build und schreibt
`src/data/readings.json`. Die Startseite ist eine Server-Komponente und importiert diese Datei
direkt, die Historie steht also schon im ausgelieferten HTML. Kein Nachladen im Browser, kein
Spinner für Daten, die sich nach dem Build ohnehin nicht mehr ändern.

Nur der Live-Teil läuft im Browser. Genau ein Hook (`src/app/hooks/useLiveReading.js`) hält die
MQTT-Verbindung offen und wird von der History- und der Live-Seite gemeinsam genutzt. Messwerte,
die während des Besuchs eintreffen, werden der Historie im Speicher vorangestellt, aber von hier
aus nicht in die Datenbank zurückgeschrieben.

## Lokal starten

```bash
cd webanwendung
npm install
npm run dev        # predev exportiert die Datenbank nach src/data/readings.json
```

```bash
npm run lint
npm run build      # schreibt die statische Seite nach out/
```

## Projektaufbau

```
webanwendung/                Next.js-Webanwendung
  data/wetterdaten.db          gesammelte Messwerte, Quelle der Historie
  scripts/export-readings.mjs  Datenbank -> src/data/readings.json, läuft vor dev und build
  src/lib/                     Datenzugriff und Formatierung, ohne React
  src/app/                     Routen: / (Historie), /live, /hardware
  src/app/components/          UI, "use client" nur wo der Browser gebraucht wird
  src/app/hooks/               die gemeinsame MQTT-Verbindung
firmware/                    ESP32-Sketches (Arduino: je Sketch ein gleichnamiger Ordner)
  esp32_hardware/              Firmware der Wetterstation
  esp32_mock_wifi/             gleiches Payload über WLAN, zum Testen ohne SIM-Karte
```


## Deployment

Jeder Push auf `main` startet `.github/workflows/deploy.yml`: installieren, linten, bauen und
`webanwendung/out/` auf GitHub Pages veröffentlichen.
