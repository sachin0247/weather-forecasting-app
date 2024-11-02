// Selected all required elements
const searchBtn = document.getElementById("search-btn");
const currentLocationBtn = document.getElementById("current-location-btn");
const cityInput = document.getElementById("city-input");
const cityName = document.getElementById("city-name");
const errorMessage = document.getElementById("error-message");
const recentCities = document.getElementById("recent-cities");
const hideCurrent = document.querySelector(".hideCurrent");
const hideAll = document.querySelector(".hideAll");

const apiKey = "8f6200216e7a219e044fb1179fea87b6";

// Fetch Weather based on city name
const fetchWeather = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City Not Found");
    }

    const data = await response.json();
    updateWeather(data);
    saveCityToLocalStorage(city);
    updateRecentCitiesDropdown();
    cityInput.value = "";
    cityName.textContent = `Weather forecast for ${data.city.name}`;
    clearError();
  } catch (error) {
    displayError(error.message);
  }
};

// Fetch Weather based on current location
const fetchWeatherByCoords = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Weather data:", data); // Debugging
    updateWeather(data);
    cityName.textContent = `Weather forecast for ${data.city.name}`;
    clearError();
  } catch (error) {
    displayError(error.message);
  }
};

// Update Weather data on the UI
const updateWeather = (data) => {
  const current = data.list[0];
  document.getElementById("current-date").textContent = new Date(
    current.dt * 1000
  ).toLocaleDateString();
  document.getElementById(
    "current-temp"
  ).textContent = `${current.main.temp}°C`;
  document.getElementById(
    "current-humidity"
  ).textContent = `${current.main.humidity}%`;
  document.getElementById(
    "current-wind-speed"
  ).textContent = `${current.wind.speed} km/h`;
  document.getElementById(
    "current-icon"
  ).src = `http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  document.getElementById("current-description").textContent =
    current.weather[0].description;

  for (let i = 1; i <= 5; i++) {
    const forecast = data.list[i * 8 - 1];
    const forecastEl = document.getElementById(`forecast-${i}`);
    forecastEl.innerHTML = `
      <p><strong>Date:</strong> ${new Date(
        forecast.dt * 1000
      ).toLocaleDateString()}</p>
      <p><strong>Temp:</strong> ${forecast.main.temp}°C</p>
      <p><strong>Humidity:</strong> ${forecast.main.humidity}%</p>
      <p><strong>Wind:</strong> ${forecast.wind.speed} km/h</p>
      <img src="http://openweathermap.org/img/wn/${
        forecast.weather[0].icon
      }@2x.png" alt="Weather Icon">
      <p>${forecast.weather[0].description}</p>`;
  }
};

// Error Handling
const displayError = (message) => {
  errorMessage.textContent = message;
};

const clearError = () => {
  errorMessage.textContent = "";
};

// Save city to local storage
const saveCityToLocalStorage = (city) => {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
};

// Update Recent Cities Dropdown
const updateRecentCitiesDropdown = () => {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCities.innerHTML = cities.length
    ? cities.map((city) => `<option>${city}</option>`).join("")
    : "";
  recentCities.classList.toggle("hidden", !cities.length);
};

// Fetch Weather for selected recent city
const fetchWeatherFromRecentCities = () => {
  const selectedCity = recentCities.value;
  if (selectedCity) {
    fetchWeather(selectedCity);
  }
};

// Event listeners for buttons
searchBtn.addEventListener("click", () => {
  const city = cityInput.value;
  if (city) {
    fetchWeather(city);
  } else {
    displayError("Please enter a city name.");
  }
});

currentLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    });
  } else {
    displayError("Geolocation not supported by your browser");
  }
});

// Event listener for recent cities dropdown
recentCities.addEventListener("change", fetchWeatherFromRecentCities);

// Initialize page
updateRecentCitiesDropdown();
