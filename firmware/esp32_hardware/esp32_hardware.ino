#define TINY_GSM_MODEM_SIM7000
//#define DUMP_AT_COMMANDS
//#define TINY_GSM_DEBUG Serial

#include <Arduino.h>
#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <HardwareSerial.h>
#include "DHT.h"
#include <StreamDebugger.h>
#include <WiFi.h>

// PIN DEFINITIONS & CONSTANTS 
#define uS_TO_S_FACTOR 1000000
#define TIME_TO_SLEEP 5
#define MODEM_RX 26
#define MODEM_TX 27
#define PWR_PIN 4
#define BAT_ADC 35
#define DHTPIN 25                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

HardwareSerial SerialAT(1);

//TinyGsm modem(SerialAT);

StreamDebugger debugger(SerialAT, Serial);
TinyGsm modem(debugger);
TinyGsmClient client(modem);

PubSubClient mqtt(client);

const char simPIN[] = "*";
const char apn[] = "TM"; // Things Mobile

const char *broker_url = "broker.emqx.io";
int broker_url_port = 1883;
const char *topic = "fhswf/lennard/json";

const unsigned long INTERVAL = 60000;
unsigned long lastSend = 0;
int batteryPercent = 0;

String gpsStatus = "NOT_FOUND";
float lat = 0;
float lon = 0;

void modemPowerOn(){
  pinMode(PWR_PIN, OUTPUT);
  digitalWrite(PWR_PIN, LOW);
  delay(1000);
  digitalWrite(PWR_PIN, HIGH);
}

void modemPowerOff(){
  pinMode(PWR_PIN, OUTPUT);
  digitalWrite(PWR_PIN, LOW);
  delay(1500);
  digitalWrite(PWR_PIN, HIGH);
}

int readBatteryPercent() {
  uint16_t raw = analogRead(BAT_ADC);
  float voltage = ((float)raw / 4095.0) * 3.3 * 2.0;

  float minV = 3.2;
  float maxV = 4.2;

  int percent = (voltage - minV) / (maxV - minV) * 100.0;

  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  return percent;
}

void setup() {
  Serial.begin(115200);
  SerialAT.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
  Serial.println("execute setup()");

  setCpuFrequencyMhz(80);
  WiFi.mode(WIFI_OFF);
  btStop();

  batteryPercent = readBatteryPercent();

  modemPowerOn();

  modem.init();
  delay(10000);

  for(int i = 0; i < 3; i++){
    SerialAT.println("AT");
    delay(1000);
  }

  if (strlen(simPIN) && modem.getSimStatus() != 3) {
    modem.simUnlock(simPIN);
    Serial.println("SIM unlocked");
  }

  modem.waitForNetwork();
  modem.gprsConnect(apn);

  modem.enableGPS();
  modem.waitResponse();

modem.sendAT("+SGPIO=0,4,1,1");
modem.waitResponse();

modem.sendAT("+CGNSPWR=1");
modem.waitResponse();

modem.sendAT("+CGNSCOLD");
modem.waitResponse();

modem.sendAT("+CGNSXTRA=1 ");
modem.waitResponse();


// Zeit geben mit delay
delay(5000);

modem.sendAT("+CGNSTST=1");
modem.waitResponse();

  delay(5000);

  gpsStatus = "NOT_FOUND";

  unsigned long start = millis();

  while (millis() - start < 4*60000) {
    if (modem.getGPS(&lat, &lon)) {
      Serial.printf("lat:%f lon:%f\n", lat, lon);
      gpsStatus = "OK";
      break;
    } else {
      Serial.println("searching GPS ...");
    }
    delay(2000);
  }
  
  mqtt.setServer(broker_url, broker_url_port);

  Serial.println("Verbinde MQTT...");

  if (mqtt.connect("sim7000-client")) {
    Serial.println("MQTT verbunden");
  } else {
    Serial.print("MQTT Fehler: ");
    Serial.println(mqtt.state());
  }
}

void loop() {
  mqtt.loop();

  if (millis() - lastSend > INTERVAL) {
    lastSend = millis();

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("DHT Fehler!");
      humidity = 100.0;
      temperature = 100.0;
    }

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

    Serial.println("Disconnect MQTT");
    mqtt.disconnect();
    delay(5000);

    Serial.println("Disconnect GPRS");
    modem.gprsDisconnect();
    delay(5000);

    Serial.println("Powering off");
    modem.poweroff();
    delay(15000);

    Serial.println("Entering deep sleep mode");
    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP);
    esp_deep_sleep_start();
  }
}