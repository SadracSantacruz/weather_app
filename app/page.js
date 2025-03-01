"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import USMap from "@/components/USMap";

export default function Home() {
  const [city, setCity] = useState("");
  const router = useRouter();
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    console.log("Loading geoJsonData...");

    fetch("/gz_2010_us_040_00_5m.json") // Fetch instead of import
      .then((response) => response.json())
      .then((data) => {
        console.log("GeoJSON Loaded:", data);
        setGeoJsonData(data);
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  const handleSearch = () => {
    if (city.trim()) {
      router.push(`/weather/${city.trim()}`);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Weather App</h1>
      <p className={styles.subtitle}>
        Search for weather data or click on a state below:
      </p>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={styles.input}
        />
        <button className={styles.button} onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className={styles.mapContainer}>
        {geoJsonData ? (
          <USMap geoJsonData={geoJsonData} />
        ) : (
          <p>Loading map...</p>
        )}
      </div>
    </main>
  );
}
