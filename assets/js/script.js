
function initPage() {
    const inputCity = document.getElementById("enter-city");
    const inputSearch = document.getElementById("search-button");
    const inputName = document.getElementById("city-name");
    const inputCurrentPic = document.getElementById("current-pic");
    const inputCurrentTemp = document.getElementById("temperature");
    const inputCurrentHumidity = document.getElementById("humidity");
    const inputCurrentWind = document.getElementById("wind-speed");
    const inputCurrentUV = document.getElementById("UV-index");
    const inputHistory = document.getElementById("history");
    var fivedayEl = document.getElementById("fiveday-header");
    var showToday = document.getElementById("today-weather");
    let searchPast10 = JSON.parse(localStorage.getItem("search")) || [];

    // Assigning a unique API to a variable
    const APIKey = "a7010b48831fe9f163425363f2cd2f84";

    function getWeather(cityName) {
        // Execute a current weather get request from open weather api
        let queryURL = "https://api.openweathermap.org/data/2.5/forecast/daily?" + cityName + "&cnt=5" + "&appid=" + APIKey;
        axios.get(queryURL)
            .then(function (response) {

                showToday.classList.remove("d-none");

                // Parse response to display current weather
                const currentDate = new Date(response.data.dt * 1000);
                const day = currentDate.getDate();
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();
                inputName.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
                let weatherPic = response.data.weather[0].icon;
                inputCurrentPic.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                inputCurrentPic.setAttribute("alt", response.data.weather[0].description);
                inputCurrentTemp.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
                inputCurrentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                inputCurrentWind.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                
                // Get UV Index
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                let UVQueryURL = "https://api.openweathermap.org/data/2.5/forecast/daily?" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
                axios.get(UVQueryURL)
                    .then(function (response) {
                        let UVIndex = document.createElement("span");
                        
                        // When UV Index is good, shows green, when ok shows yellow, when bad shows red
                        if (response.data[0].value < 4 ) {
                            UVIndex.setAttribute("class", "badge badge-success");
                        }
                        else if (response.data[0].value < 8) {
                            UVIndex.setAttribute("class", "badge badge-warning");
                        }
                        else {
                            UVIndex.setAttribute("class", "badge badge-danger");
                        }
                        console.log(response.data[0].value)
                        UVIndex.innerHTML = response.data[0].value;
                        inputCurrentUV.innerHTML = "UV Index: ";
                        inputCurrentUV.append(UVIndex);
                    });
                
                // Get 5 day forecast for this city
                let cityID = response.data.id;
                let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
                axios.get(forecastQueryURL)
                    .then(function (response) {
                        fivedayEl.classList.remove("forecast-header");
                        
                        //  Parse response to display forecast for next 5 days
                        const forecastEls = document.querySelectorAll(".forecast");
                        for (i = 0; i < forecastEls.length; i++) {
                            forecastEls[i].innerHTML = "";
                            const forecastIndex = i * 8 + 4;
                            const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                            const forecastDay = forecastDate.getDate();
                            const forecastMonth = forecastDate.getMonth() + 1;
                            const forecastYear = forecastDate.getFullYear();
                            const forecastDateEl = document.createElement("p");
                            forecastDateEl.setAttribute("class", "mt-3 mb-0 forecast-date");
                            forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
                            forecastEls[i].append(forecastDateEl);

                            // Icon for current weather
                            const forecastWeatherEl = document.createElement("img");
                            forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                            forecastWeatherEl.setAttribute("alt", response.data.list[forecastIndex].weather[0].description);
                            forecastEls[i].append(forecastWeatherEl);
                            const forecastTempEl = document.createElement("p");
                            forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
                            forecastEls[i].append(forecastTempEl);
                            const forecastHumidityEl = document.createElement("p");
                            forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                            forecastEls[i].append(forecastHumidityEl);
                        }
                    })
            });
    }

    // Get history from local storage if any
    inputSearch.addEventListener("click", function () {
        const searchTerm = inputCity.value;
        getWeather(searchTerm);
        searchPast10.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchPast10));
        rendersearchPast10();
    })

    function k2f(K) {
        return Math.floor((K - 273.15) * 1.8 + 32);
    }

    function rendersearchPast10() {
        inputHistory.innerHTML = "";
        for (let i = 0; i < searchPast10.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type", "text");
            historyItem.setAttribute("readonly", true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchPast10[i]);
            historyItem.addEventListener("click", function () {
                getWeather(historyItem.value);
            })
            inputHistory.append(historyItem);
        }
    }

    rendersearchPast10();
    if (searchPast10.length > 0) {
        getWeather(searchPast10[searchPast10.length - 1]);
    }
    
}

initPage();