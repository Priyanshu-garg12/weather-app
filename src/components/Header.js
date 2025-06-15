import React, { useState } from 'react'

const Header = ({ getWeatherData }) => {
    const [city, setCity] = useState('');

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && city.trim()) {
            getWeatherData('', '', city.trim());
            setCity('');
        }
    }

    return (
        <div className="row d-flex justify-content-between">
            <div className="col-md-8 mt-5">
                <h1 className="text-white">Weather App</h1>
            </div>
            <div className="col-md-4">
                <input
                    type="text"
                    className="form-control bg-transparent text-white mt-5 mb-5"
                    placeholder="Enter city name (e.g., London)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
        </div>
    )
}

export default Header
