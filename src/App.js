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
  const [weatherData, setWeatherData] = useState({});
  const [error, setError] = useState(null);

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
      setError(null);
      const query = city || `${latitude},${longitude}`;
      const res = await axios.get(
        `https://api.weatherstack.com/current?access_key=cb2d131eae9d0953b0a28715f02d9cd0&query=${query}`
      );
      
      if (res.data.error) {
        setError(res.data.error.info);
        return;
      }

      const data = res.data;
      setWeatherData({
        temperature: data.current.temperature,
        description: data.current.weather_descriptions[0],
        location: data.location.name,
        region: data.location.region,
        country: data.location.country,
        wind_speed: data.current.wind_speed,
        pressure: data.current.pressure,
        precip: data.current.precip,
        humidity: data.current.humidity,
        img: data.current.weather_icons,
      });
    } catch (error) {
      setError(error.message || 'Failed to fetch weather data');
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="container">
      <Header getWeatherData={getWeatherData} />
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <DisplayWeatherData {...weatherData} />
      )}
    </div>
  );
}

export default App;
