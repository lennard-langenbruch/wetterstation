# Mobile Wetterstation

## Lokal starten

```bash
cd webanwendung
npm install
#  hook "predev" in package.json, führt scripts/export-readings.mjs aus und exportiert die datenbank nach src/data/readings.json
npm run dev        
```

```bash
npm run lint
npm run build      # schreibt die statische seite nach out/ für den build
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

## Hardware
### ESP32 Dev Modul mit DHT22 Temperatursensor an Powerbank über WLAN
<img height="200" alt="grafik" src="https://github.com/user-attachments/assets/573a8094-79ab-4721-bbeb-9142e7b98a41" />

### LILYGO7000G: ESP32 mit Akku Slot über GPS-fähiges LTE Modul und provisorischen DHT11
<img  height="300" alt="grafik" src="https://github.com/user-attachments/assets/cae90bad-d080-406c-8dfd-7c2668b7b14e"/>

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

## Deployment

Jeder Push auf `main` startet `.github/workflows/deploy.yml`: installieren, linten, bauen und
`webanwendung/out/` auf GitHub Pages veröffentlichen.

## Todos
<ul>
<li>BME680 fest löten</li>
<li>Asymmetrische Verschlüsselung d. JSON Payload</li>
<li>Typescript refactor; Frontend</li>
</ul>



