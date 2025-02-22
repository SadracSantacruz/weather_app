"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// Charts
import TemperatureChart from "@/components/TemperatureChart";
import WindSpeedChart from "@/components/WindSpeedChart";
// Styles
import styles from "./page.module.css";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export default function WeatherPage() {
  const { city } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("temperature"); // 🔥 Controls which chart is shown

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
            {/* Toggle Buttons */}
            <div className={styles.buttonGroup}>
              <button
                className={
                  activeChart === "temperature"
                    ? styles.activeButton
                    : styles.button
                }
                onClick={() => setActiveChart("temperature")}
              >
                Temperature Trend
              </button>
              <button
                className={
                  activeChart === "wind" ? styles.activeButton : styles.button
                }
                onClick={() => setActiveChart("wind")}
              >
                Wind Speed Variations
              </button>
            </div>
            {/* Show Only One Chart at a Time */}
            {forecastData && activeChart === "temperature" && (
              <TemperatureChart data={forecastData} />
            )}
            {forecastData && activeChart === "wind" && (
              <WindSpeedChart data={forecastData} />
            )}
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
