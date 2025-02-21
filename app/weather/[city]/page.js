"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// Charts
import TemperatureChart from "@/components/TemperatureChart";
import WindSpeedChart from "@/components/WindSpeedChart";
// Styles
import styles from "./page.module.css";

const API_KEY = "202267e16383106641f061275bef8c46"; // 🔥 Replace with your actual API key

export default function WeatherPage() {
  const { city } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;

    async function fetchWeather() {
      try {
        // Fetch current weather
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const weather = await weatherRes.json();
        console.log("🌤 Current Weather API Response:", weather);
        setWeatherData(weather);

        // Fetch 5-day forecast
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecast = await forecastRes.json();
        console.log("📡 Forecast API Response:", forecast);

        setForecastData(forecast.list || []); // ✅ Ensure forecastData is an array
      } catch (err) {
        console.error("❌ API Fetch Error:", err.message);
        setError(err.message);
      }
    }

    fetchWeather();
  }, [city]);
  return (
    <main className={styles.container}>
      <h1>Weather in {decodeURIComponent(city)}</h1>

      {error ? (
        <p className={styles.error}>{error}</p>
      ) : weatherData ? (
        <div className={styles.weatherSection}>
          {/* Weather Details Card */}
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

          {/* Chart Container */}
          <div className={styles.chartsContainer}>
            <div className={styles.chartBox}>
              <TemperatureChart data={forecastData} />
            </div>
            <div className={styles.chartBox}>
              <WindSpeedChart data={forecastData} />
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <Link href="/" className={styles.link}>
        Back to Search
      </Link>
    </main>
  );
}
