const apiKey = "cf8179aab18482a01e67a2e7c729b50e"; 
const city = "Guatemala,GT";
const units = "metric";

const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;

async function getWeather() {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayWeather(currentData, forecastData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function displayWeather(current, forecast) {
  const container = document.getElementById("current-weather");
  if (!container) return;

  const temp = Math.round(current.main.temp);
  const desc = current.weather[0].description;
  const icon = current.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  let html = `
    <h2>Weather in Guatemala</h2>
    <div class="weather-now">
      <img src="${iconUrl}" alt="${desc}" width="60" height="60">
      <p><strong>${temp}°C</strong> - ${desc}</p>
    </div>
    <div class="forecast-days">
  `;

  const daily = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt_txt);
    if (date.getHours() === 12) {
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      if (!daily[day]) {
        daily[day] = {
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          desc: item.weather[0].description
        };
      }
    }
  });

  Object.entries(daily).slice(0, 3).forEach(([day, data]) => {
    html += `
      <div class="forecast-day">
        <p><strong>${day}</strong></p>
        <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="${data.desc}" width="50" height="50">
        <p>${data.temp}°C</p>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

getWeather();