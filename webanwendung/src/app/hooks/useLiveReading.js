"use client";

import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { toNumber } from "@/lib/format";

export const MQTT_URL = "wss://broker.emqx.io:8084/mqtt";
export const MQTT_TOPIC = "fhswf/lennard/json";

/**
 * Subscribes to the weather station's MQTT topic.
 * Shared by the history and the live page so the connection logic exists only once.
 */
export default function useLiveReading() {
  const [connected, setConnected] = useState(false);
  const [latest, setLatest] = useState(null);
  const [liveReadings, setLiveReadings] = useState([]);

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL);

    client.on("connect", () => {
      setConnected(true);
      client.subscribe(MQTT_TOPIC);
    });

    client.on("message", (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        const reading = {
          time: new Date().toISOString(),
          temperature: toNumber(payload.temperature),
          humidity: toNumber(payload.humidity),
          lon: toNumber(payload.lon),
          lat: toNumber(payload.lat),
          battery: toNumber(payload.battery),
          gps: payload.gps ?? null,
          live: true
        };
        setLatest(reading);
        setLiveReadings((previous) => [reading, ...previous]);
      } catch (error) {
        console.error("Invalid MQTT message:", error);
      }
    });

    client.on("close", () => setConnected(false));
    client.on("error", (error) => {
      console.error("MQTT error:", error);
      setConnected(false);
    });

    return () => client.end(true);
  }, []);

  return { latest, connected, liveReadings };
}
