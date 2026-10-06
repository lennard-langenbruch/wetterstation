// Mock-Version von esp32_hardware.ino für einen ESP32 ohne SIM7000/GPS-Modem.
// Verbindet sich per WLAN statt Mobilfunk und schickt frei erfundene, aber
// plausible Messwerte an denselben MQTT-Broker/Topic. Payload-Format ist
// identisch zum echten Gerät, die Next.js-App merkt keinen Unterschied.

#include <WiFi.h>
#include <PubSubClient.h>

// WLAN-Zugangsdaten anpassen
const char *wifiSsid = "DEIN_WLAN";
const char *wifiPassword = "DEIN_WLAN_PASSWORT";

const char *broker_url = "broker.emqx.io";
int broker_url_port = 1883;
const char *topic = "fhswf/lennard/json";

// Basis-Position, um die die simulierten GPS-Punkte streuen (Wuppertal)
const float BASE_LAT = 51.2562;
const float BASE_LON = 7.1508;

const unsigned long INTERVAL = 15000; // zum Testen kurz, für "echten" Betrieb z.B. 60000
unsigned long lastSend = 0;

WiFiClient espClient;
PubSubClient mqtt(espClient);

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("Verbinde WLAN \"%s\"...\n", wifiSsid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(wifiSsid, wifiPassword);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WLAN verbunden, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WLAN Verbindung fehlgeschlagen");
  }
}

void connectMqtt() {
  if (mqtt.connected()) return;

  Serial.println("Verbinde MQTT...");
  if (mqtt.connect("esp32-mock-client")) {
    Serial.println("MQTT verbunden");
  } else {
    Serial.print("MQTT Fehler: ");
    Serial.println(mqtt.state());
  }
}

// Zufallswert als float zwischen min und max
float randomFloat(float min, float max) {
  return min + (max - min) * (random(0, 10000) / 10000.0);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("execute setup() — Mock-Modus (WLAN, kein Modem)");

  randomSeed(esp_random());

  connectWifi();
  mqtt.setServer(broker_url, broker_url_port);
  connectMqtt();
}

void loop() {
  connectWifi();
  mqtt.loop();
  if (!mqtt.connected()) connectMqtt();

  if (millis() - lastSend > INTERVAL) {
    lastSend = millis();

    // Erfundene, aber realistische Werte
    float temperature = randomFloat(18.0, 27.0);
    float humidity = randomFloat(35.0, 65.0);
    int batteryPercent = random(0, 101);

    // GPS meistens "OK" mit leichtem Jitter um die Basis-Position, gelegentlich "NOT_FOUND"
    bool gpsFix = random(0, 10) > 1; // ~80% "OK"
    String gpsStatus = gpsFix ? "OK" : "NOT_FOUND";
    float lat = BASE_LAT + randomFloat(-0.01, 0.01);
    float lon = BASE_LON + randomFloat(-0.01, 0.01);

    String payload = "{";
    payload += "\"temperature\":" + String(temperature) + ",";
    payload += "\"humidity\":" + String(humidity) + ",";
    payload += "\"battery\":" + String(batteryPercent) + ",";
    payload += "\"gps\":\"" + gpsStatus + "\"";

    if (gpsStatus == "OK") {
      payload += ",\"lat\":" + String(lat, 6);
      payload += ",\"lon\":" + String(lon, 6);
    }

    payload += "}";

    Serial.println(payload);
    mqtt.publish(topic, payload.c_str());
  }
}
