"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css"; // ✅ Ensure styles are imported correctly

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
      <h1>Weather App</h1>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={styles.input} // ✅ Add missing class if needed
        />
        <button className={styles.button} onClick={handleSearch}>
          Search
        </button>
      </div>
    </main>
  );
}
