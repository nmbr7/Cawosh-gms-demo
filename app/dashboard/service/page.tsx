"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type LocationData = {
  lat: number;
  lng: number;
};

export default function ServicePage() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchLocation = () => {
      if (!("geolocation" in navigator)) {
        setError("Geolocation is not supported.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);
          sendToBackend(coords);
        },
        (err) => {
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    };

    if (watching) {
      fetchLocation(); // initial immediately
      intervalId = setInterval(fetchLocation, 5000); // every 5 sec
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [watching]);

  const sendToBackend = async (data: LocationData) => {
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send location");
    } catch (err) {
      console.error("Location send error:", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Start Service</h1>

      <Button onClick={() => setWatching(!watching)}>
        {watching ? "Stop Service" : "Start Service & Track Location"}
      </Button>

      {location && (
        <div className="mt-4 text-sm text-green-700">
          📍 Lat: {location.lat}, Lng: {location.lng}
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  );
}
