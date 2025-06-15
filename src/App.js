import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Header from './components/Header'
import DisplayWeatherData from './components/DisplayWeatherData'

function App() {
  const [location, setLocation] = useState({
    latitude: 45,
    longitude: 45,
  });
  const [weatherData, setWeatherData] = useState(() => {
    // Try to load cached data on initial render
    const cached = localStorage.getItem('weatherData');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 60 * 1000) { // 30 minutes cache
        return data;
      }
    }
    return {};
  });
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(() => {
    const cached = localStorage.getItem('weatherData');
    return cached ? JSON.parse(cached).timestamp : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          getWeatherData(newLocation.latitude, newLocation.longitude, '');
        },
        (error) => {
          console.error("Error getting location:", error);
          getWeatherData(location.latitude, location.longitude, '');
        }
      );
    } else {
      getWeatherData(location.latitude, location.longitude, '');
    }
  }, []);

  const getWeatherData = async (latitude, longitude, city) => {
    try {
      // Check if we have recent data
      if (lastFetch && weatherData.current) {
        const timeSinceLastFetch = Date.now() - lastFetch;
        if (timeSinceLastFetch < CACHE_DURATION) {
          return; // Use cached data if it's less than 30 minutes old
        }
      }

      if (isLoading) return; // Prevent multiple simultaneous requests
      setIsLoading(true);
      setError(null);

      const query = city || `${latitude},${longitude}`;
      
      // Add a small delay to help with rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await axios.get(
        `https://api.weatherstack.com/current?access_key=21663b978e2f9666bf5b6f991097c242&query=${query}`
      );
      
      if (res.data.error) {
        let errorMessage = res.data.error.info;
        if (errorMessage.includes("rate limitation")) {
          // Try to use cached data if available when hitting rate limits
          const cached = localStorage.getItem('weatherData');
          if (cached) {
            const { data } = JSON.parse(cached);
            setWeatherData(data);
            errorMessage = "Using cached weather data. New data temporarily unavailable due to rate limits.";
          } else {
            errorMessage = "Weather data is temporarily unavailable. Please try again in a few minutes.";
          }
        }
        setError(errorMessage);
        return;
      }

      const data = res.data;
      setWeatherData(data);
      const timestamp = Date.now();
      setLastFetch(timestamp);
      
      // Save to localStorage
      localStorage.setItem('weatherData', JSON.stringify({
        data,
        timestamp
      }));

    } catch (err) {
      setError("Unable to fetch weather data. Please try again later.");
      console.error("Error fetching weather data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Header getWeatherData={getWeatherData} />
      {isLoading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : weatherData.current ? (
        <DisplayWeatherData 
          temperature={weatherData.current.temperature}
          description={weatherData.current.weather_descriptions?.[0]}
          location={weatherData.location?.name}
          region={weatherData.location?.region}
          country={weatherData.location?.country}
          wind_speed={weatherData.current.wind_speed}
          pressure={weatherData.current.pressure}
          precip={weatherData.current.precip}
          humidity={weatherData.current.humidity}
          img={weatherData.current.weather_icons?.[0]}
        />
      ) : null}
    </div>
  );
}

export default App;
