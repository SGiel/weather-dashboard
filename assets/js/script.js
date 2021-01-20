var cityNameSubmitEl = document.querySelector("#city-form");
var cityNameEl = document.querySelector("#city-name");
var weatherCurrentDayEl = document.querySelector("#weather-current-day");
var weatherForecastEl = document.querySelector("#weather-forecast");
var forecastHeaderEl = document.querySelector("#forecast-header");

// the names of cities searched for
var cities = [];
// current city weather information
var cityWeather = {};
// forecasted city weather information
var cityForecast = {
        forecastDate: [],
        forecastTemp: [],
        forecastHumidity: [],
        forecastIcon: []
};

// clears out HTML in element with particular id
var refresh = function (idToRefresh) {
    idToRefresh.innerHTML = '';
}

var getCityWeather = function (cityName) {

    var apiUrlWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=36badb05283e47c914843551c2046d2d";
    // fetch current weather
    fetch(apiUrlWeather).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(" the original data", data);

                cityWeather.name = cityName;
                cityWeather.temp = data.main.temp;
                cityWeather.humidity = data.main.humidity;
                cityWeather.windSpeed = data.wind.speed;
                cityWeather.icon = data.weather[0].icon;
                cityWeather.coordLon = data.coord.lon;
                cityWeather.coordLat = data.coord.lat;
                // get date in local time of city searched
                cityWeather.date = moment(data.date).utcOffset(data.timezone/3600);
                console.log("cityWeather after current date added", cityWeather.date.format("MM/DD/YYYY HH:mm:ss"));
 
                // gets uv index
                var apiUrlUvi = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityWeather.coordLat + "&lon=" + cityWeather.coordLon + "&appid=36badb05283e47c914843551c2046d2d";
                fetch(apiUrlUvi).then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {
                            console.log("UVI data", data);
                            cityWeather.uvi = data.value;

                            //cities.push(cityWeather);
                            //console.log(cities);
                            
                            // gets 5-day forecast
                            var apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&units=imperial&appid=36badb05283e47c914843551c2046d2d";
                            fetch(apiUrlForecast).then(function (response) {
                                if (response.ok) {
                                    response.json().then(function (data) {
                                        //console.log("data coming from forecast ", data);
                                        // capture forecasts 11am to 2pm  day + 1, 2, 3, 4, 5
                                        for (i = 0; i < data.list.length; i++) {
                                            //get forecast date in local time of city searched
                                            getForecastDate = moment.unix(data.list[i].dt).utcOffset(data.city.timezone/3600);
                                            day = parseInt(getForecastDate.format("DD")) - parseInt(cityWeather.date.format("DD"));
                                            time = parseInt(getForecastDate.format("HH"));
                                            
                                            // capturing forecast mid-day the next day or current day
                                            if (time >= 11 && time < 14) {
                                                console.log("cityForecast time: ", getForecastDate.format("MM/DD/YYYY HH:mm:ss"));
                                                cityForecast.forecastHumidity.push(data.list[i].main.humidity);
                                                cityForecast.forecastTemp.push(data.list[i].main.temp);
                                                cityForecast.forecastDate.push(getForecastDate);
                                                cityForecast.forecastIcon.push(data.list[i].weather[0].icon);
                                                console.log("cityForecast ", cityForecast);
                                            }                                           
                                        }

                                        displayWeather();
                                        displayForecast();
                                    });
                                } else {
                                    alert("Error in 5-day forecast: " + response.statusText);
                                    return;
                                }
                            });
                        });
                    } else {
                        alert("Error in UVI: " + response.statusText);
                        return;
                    }
                });

                // end of response.json.then
            });
        } else {
            alert("Error: " + response.statusText);
            return;
        }
    });
    // end getCityWeather function      
};



var getCityName = function (event) {
    event.preventDefault();

    var cityName = cityNameEl.value.trim();

    getCityWeather(cityName);

}

var displayWeather = function () {
    refresh(weatherCurrentDayEl);
    var cityName = document.createElement("h3");
    cityName.textContent = cityWeather.name + " (" + cityWeather.date.format("MM/DD/YYYY") + ")";
    cityName.id = "city-name";

    var cityTemperature = document.createElement("p");
    cityTemperature.textContent = "Temperature: " + cityWeather.temp.toString() + " ℉";

    var cityHumidity = document.createElement("p");
    cityHumidity.textContent = "Humidity: " + cityWeather.humidity.toString() + "%";

    var cityWindSpeed = document.createElement("p");
    cityWindSpeed.textContent = "Wind Speed: " + cityWeather.windSpeed.toString() + " MPH";

    var cityUvIndex = document.createElement("p");
    cityUvIndex.textContent = "UV Index: ";
    var cityUvIndexColor = document.createElement("span");
    cityUvIndexColor.textContent = cityWeather.uvi.toString();
    if (cityWeather.uvi <= 2) {
        cityUvIndexColor.id = "uv-index-mild";
    } else if (cityWeather.uvi <+ 5) {
        cityUvIndexColor.id = "uv-index-moderate";
    } else if (cityWeather.uvi >= 6) {
        cityUvIndexColor.id = "uv-index-severe";
    }
    cityUvIndex.appendChild(cityUvIndexColor);

    weatherCurrentDayEl.append(cityName, cityTemperature, cityHumidity, cityWindSpeed, cityUvIndex);

}

var displayForecast = function () {
    var cityName = document.createElement("h3");
    cityName.textContent = cityWeather.name + "(" + cityWeather.date + ")";
    cityName.id = "city-name";

    refresh(forecastHeaderEl);
    refresh(weatherForecastEl);

    var forecastHeader = document.createElement("h2");
    forecastHeader.textContent = "5-Day Forecast:";
    forecastHeaderEl.appendChild(forecastHeader);

    // displays forecasted weather elements on page
    for (i = 0; i < cityForecast.forecastDate.length; i++) {
        var cardContainer = document.createElement("div");
        cardContainer.setAttribute("class", "card mr-2");
        var cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");
        var cardTitle = document.createElement("h6");
        cardTitle.textContent = cityForecast.forecastDate[i].format("MM/DD/YYYY");

        cardTitle.setAttribute("class", "card-title");
        var forecastIcon = document.createElement("img");
        forecastIcon.src = "http://openweathermap.org/img/wn/" + cityForecast.forecastIcon[i] + "@2x.png";
        var forecastTemp = document.createElement("p")
        forecastTemp.textContent = "Temp: " + cityForecast.forecastTemp[i] + " ℉";
        var forecastHumidity = document.createElement("p");
        forecastHumidity.textContent = "Humidity: " + cityForecast.forecastHumidity[i] + "%";

        cardBody.append(cardTitle, forecastIcon, forecastTemp, forecastHumidity);
        cardContainer.appendChild(cardBody);
        weatherForecastEl.appendChild(cardContainer);
    }
    // end of displayForecast Function
}

cityNameSubmitEl.addEventListener("submit", getCityName);




