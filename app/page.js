"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css"; // ✅ Ensure styles are imported correctly
import USMap from "@/components/USMap";

export default function Home() {
  const [city, setCity] = useState("");
  const router = useRouter();

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

      {/* ✅ Search Bar */}
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

      {/* ✅ US Choropleth Map Below Search */}
      <div className={styles.mapContainer}>
        <USMap />
      </div>
    </main>
  );
}
