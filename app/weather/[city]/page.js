"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

const API_KEY = "202267e16383106641f061275bef8c46"; // 🔥 Replace with your actual API key

export default function WeatherPage() {
  const { city } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchWeather();
  }, [city]);

  return (
    <main className={styles.container}>
      <h1>Weather in {city}</h1>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : weatherData ? (
        <div className={styles.weatherDetails}>
          <p>
            <strong>Temperature:</strong> {weatherData.main.temp}°C
          </p>
          <p>
            <strong>Humidity:</strong> {weatherData.main.humidity}%
          </p>
          <p>
            <strong>Wind Speed:</strong> {weatherData.wind.speed} m/s
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <Link href="/">Back to Search</Link>
    </main>
  );
}
