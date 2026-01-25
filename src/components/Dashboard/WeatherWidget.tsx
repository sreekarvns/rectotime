import React, { useState, useEffect, useCallback } from 'react';
import { Wind, Droplets, MapPin, X, Search, Loader, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
  lastUpdated: number;
}

interface LocationCoords {
  lat: number;
  lon: number;
}

interface CitySearchResult {
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
  display_name?: string;
}

/**
 * WeatherWidget - Displays weather and time for selected location
 * Uses Open-Meteo free API (no API key required)
 * Uses Nominatim for city search (no API key required)
 */
export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Popular locations with coordinates
  const POPULAR_LOCATIONS: Record<string, LocationCoords> = {
    'New York': { lat: 40.7128, lon: -74.006 },
    'London': { lat: 51.5074, lon: -0.1278 },
    'Tokyo': { lat: 35.6762, lon: 139.6503 },
    'Sydney': { lat: -33.8688, lon: 151.2093 },
    'Dubai': { lat: 25.2048, lon: 55.2708 },
    'Singapore': { lat: 1.3521, lon: 103.8198 },
    'Toronto': { lat: 43.6532, lon: -79.3832 },
    'Berlin': { lat: 52.52, lon: 13.405 },
    'Paris': { lat: 48.8566, lon: 2.3522 },
    'San Francisco': { lat: 37.7749, lon: -122.4194 },
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('weather_location');
    if (savedLocation) {
      fetchWeather(savedLocation);
    }
    
    // Load minimize state
    const savedMinimized = localStorage.getItem('weather_widget_minimized');
    if (savedMinimized === 'true') {
      setIsMinimized(true);
    }
  }, []);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather data
  const fetchWeather = useCallback(async (locationName: string, coords?: LocationCoords) => {
    setLoading(true);
    setError(null);
    
    try {
      let coordinates = coords || POPULAR_LOCATIONS[locationName];
      
      if (!coordinates) {
        setError('Location not found');
        setLoading(false);
        return;
      }

      // Use Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      
      const data = await response.json();
      const current = data.current;
      
      // Map weather codes to icons
      const weatherIcon = getWeatherIcon(current.weather_code);
      const weatherCondition = getWeatherCondition(current.weather_code);

      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition: weatherCondition,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        icon: weatherIcon,
        location: locationName,
        lastUpdated: Date.now(),
      });

      // Save location to localStorage
      localStorage.setItem('weather_location', locationName);
      setShowLocationPicker(false);
      setSearchResults([]);
    } catch (err) {
      setError('Failed to fetch weather');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationSelect = (locName: string) => {
    fetchWeather(locName);
  };

  // Search for cities using Nominatim API
  const searchCities = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&format=json&limit=10`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const results: CitySearchResult[] = data
          .filter((item: any) => item.lat && item.lon)
          .slice(0, 10)
          .map((item: any) => ({
            name: item.address?.city || item.address?.town || item.address?.village || item.name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            country: item.address?.country,
            state: item.address?.state,
            display_name: item.display_name,
          }));

        // Remove duplicates based on coordinates (rounding to avoid near-duplicate cities)
        const uniqueResults = results.filter((result, index, self) => {
          return index === self.findIndex((r) => 
            Math.round(r.lat * 100) === Math.round(result.lat * 100) &&
            Math.round(r.lon * 100) === Math.round(result.lon * 100)
          );
        });

        setSearchResults(uniqueResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search cities');
    } finally {
      setSearching(false);
    }
  }, []);

  // Handle minimize toggle
  const toggleMinimize = useCallback(() => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem('weather_widget_minimized', newState ? 'true' : 'false');
  }, [isMinimized]);

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchCities(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchCities]);

  const handleCitySelect = (result: CitySearchResult) => {
    const locationName = `${result.name}${result.state ? ', ' + result.state : ''}${result.country ? ', ' + result.country : ''}`;
    fetchWeather(locationName, { lat: result.lat, lon: result.lon });
  };

  const getWeatherIcon = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0 || code === 1) return '☀️'; // Clear
    if (code === 2) return '⛅'; // Partly cloudy
    if (code === 3) return '☁️'; // Overcast
    if (code === 45 || code === 48) return '🌫️'; // Foggy
    if (code >= 51 && code <= 67) return '🌧️'; // Drizzle/Rain
    if (code >= 80 && code <= 82) return '🌧️'; // Showers
    if (code >= 85 && code <= 86) return '❄️'; // Snow showers
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code === 80) return '🌧️'; // Slight rain showers
    if (code === 81) return '🌧️'; // Moderate rain showers
    if (code === 82) return '⛈️'; // Violent rain showers
    if (code === 95 || code === 96 || code === 99) return '⛈️'; // Thunderstorm
    return '🌤️'; // Default
  };

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Drizzle';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 85 && code <= 86) return 'Snow showers';
    if (code === 95 || code === 96 || code === 99) return 'Thunderstorm';
    return 'Unknown';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isMinimized ? (
        // Minimized - Just a small floating ball
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleMinimize}
          title="Click to expand weather widget"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center text-lg"
        >
          {weather ? weather.icon : '☀️'}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-background-darkSecondary dark:to-background-dark border border-primary-200 dark:border-primary-800 rounded-xl shadow-lg p-4 w-72"
        >
          {/* Minimize Button - Expanded View */}
          <div className="flex items-center justify-end mb-3">
            <button
              onClick={toggleMinimize}
              className="text-text-secondary dark:text-text-secondaryDark hover:text-primary-600 dark:hover:text-primary-400 transition p-1"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Time Widget */}
          <div className="text-center mb-4 pb-4 border-b border-primary-200 dark:border-primary-800">
            <div className="text-sm text-text-secondary dark:text-text-secondaryDark mb-1">Current Time</div>
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 font-mono">
              {currentTime}
            </div>
          </div>

          {/* Weather Widget */}
          {weather ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
                    {weather.location}
                  </span>
                </div>
                <button
                  onClick={() => setShowLocationPicker(true)}
                  className="text-xs px-2 py-1 rounded bg-primary-200 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-300 dark:hover:bg-primary-800 transition"
                >
                  Change
                </button>
              </div>

              {/* Temperature and Condition */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {weather.temperature}°C
                  </div>
                  <div className="text-sm text-text-secondary dark:text-text-secondaryDark">
                    {weather.condition}
                  </div>
                </div>
                <div className="text-5xl">{weather.icon}</div>
              </div>

              {/* Additional info */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-primary-200 dark:border-primary-800">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="text-xs text-text-secondary dark:text-text-secondaryDark">Humidity</div>
                    <div className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
                      {weather.humidity}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="text-xs text-text-secondary dark:text-text-secondaryDark">Wind</div>
                    <div className="text-sm font-semibold text-text-primary dark:text-text-primaryDark">
                      {weather.windSpeed} km/h
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setShowLocationPicker(true)}
                className="w-full py-2 px-4 rounded-lg bg-primary-600 dark:bg-primary-700 text-white text-sm font-semibold hover:bg-primary-700 dark:hover:bg-primary-600 transition"
              >
                Select Location
              </button>
              {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
            </div>
          )}
        </motion.div>
      )}

      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-background-darkSecondary rounded-xl shadow-2xl p-6 w-96 max-h-[600px] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary dark:text-text-primaryDark">
                  Select Location
                </h3>
                <button
                  onClick={() => {
                    setShowLocationPicker(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-text-secondary dark:text-text-secondaryDark hover:text-text-primary dark:hover:text-text-primaryDark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary dark:text-text-secondaryDark" />
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-primary-50 dark:bg-background-dark border border-primary-200 dark:border-primary-800 text-text-primary dark:text-text-primaryDark placeholder-text-secondary dark:placeholder-text-secondaryDark focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                  />
                  {searching && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary-600 dark:text-primary-400" />
                  )}
                </div>
              </div>

              {/* Search Results or Popular Locations */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {searchQuery && searchResults.length > 0 ? (
                  // Search Results
                  searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCitySelect(result)}
                      disabled={loading}
                      className="w-full p-3 text-left rounded-lg bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-text-primary dark:text-text-primaryDark font-medium transition disabled:opacity-50"
                    >
                      <div className="font-semibold">{result.name}</div>
                      <div className="text-xs text-text-secondary dark:text-text-secondaryDark">
                        {result.state && `${result.state}, `}
                        {result.country}
                      </div>
                    </button>
                  ))
                ) : searchQuery && !searching ? (
                  // No results
                  <div className="text-center py-8 text-sm text-text-secondary dark:text-text-secondaryDark">
                    No cities found
                  </div>
                ) : !searchQuery ? (
                  // Popular Locations when search is empty
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-text-secondary dark:text-text-secondaryDark uppercase">
                      Popular Locations
                    </div>
                    {Object.keys(POPULAR_LOCATIONS).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => handleLocationSelect(loc)}
                        disabled={loading}
                        className="w-full p-3 text-left rounded-lg bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 text-text-primary dark:text-text-primaryDark font-medium transition disabled:opacity-50"
                      >
                        {loc}
                      </button>
                    ))}
                  </>
                ) : null}
              </div>

              {loading && (
                <div className="text-center py-4 text-sm text-text-secondary dark:text-text-secondaryDark">
                  Loading weather data...
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
