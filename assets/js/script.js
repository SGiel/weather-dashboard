var cityNameSubmitEl = document.querySelector("#city-form");
var cityNameEl = document.querySelector("#city-name");
var weatherCurrentDayEl = document.querySelector("#weather-current-day");
var weatherForecastEl = document.querySelector("#weather-forecast");
var forecastHeaderEl = document.querySelector("#forecast-header");
var cities = [];
var cityWeather = {};


var getCityWeather = function (cityName) {

    var apiUrlWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=36badb05283e47c914843551c2046d2d";
    
    // below will be used for 5 day forecast
    //var apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + ",units=imperial&appid=36badb05283e47c914843551c2046d2d";
    
    fetch(apiUrlWeather).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                console.log(data);
                //push city name into Cities array
                cityWeather.name = cityName;
                cityWeather.temp = data.main.temp;
                cityWeather.humidity = data.main.humidity;
                cityWeather.windSpeed = data.wind.speed;
                cityWeather.icon = data.weather[0].icon;
                cityWeather.coordLon = data.coord.lon;
                cityWeather.coordLat = data.coord.lat;
                
                
                // gets uv index
                var apiUrlUvi = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityWeather.coordLat + "&lon=" + cityWeather.coordLon + "&appid=36badb05283e47c914843551c2046d2d";
                fetch(apiUrlUvi).then(function (response) {
                    if (response.ok) {
                        response.json().then(function (data) {
                            console.log(data);
                        cityWeather.uvi = data.value;
                        cityWeather.date=data.date_iso;

                        cities.push(cityWeather);
                        console.log(cities);

                        displayWeather();
                        displayForecast();

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

var displayWeather = function() {
    var cityName = document.createElement("h3");
    cityName.textContent = cityWeather.name + "(" + cityWeather.date + ")";
    cityName.id = "city-name";

    var cityTemperature = document.createElement("p");
    cityTemperature.textContent = "Temperature: " + cityWeather.temp.toString() + " ℉";

    var cityHumidity = document.createElement("p");
    cityHumidity.textContent = "Humidity: " + cityWeather.humidity.toString() + " %";

    var cityWindSpeed = document.createElement("p");
    cityWindSpeed.textContent = "Wind Speed: " + cityWeather.windSpeed.toString() + " MPH";

    var cityUvIndex = document.createElement("p");
    cityUvIndex.textContent = "UV Index: " + cityWeather.uvi.toString();
    cityWeather.id = "uv-index";

    weatherCurrentDayEl.append(cityName, cityTemperature, cityHumidity, cityWindSpeed, cityUvIndex);

}

var displayForecast = function() {
    var cityName = document.createElement("h3");
    cityName.textContent = cityWeather.name + "(" + cityWeather.date + ")";
    cityName.id = "city-name";
    var forecastHeader = document.createElement("h2");
    forecastHeader.textContent = "5-Day Forecast:"; 
    forecastHeaderEl.appendChild(forecastHeader);

    for (i = 0; i < 5; i++) {
        var cardContainer = document.createElement("div");
        cardContainer.setAttribute("class", "card mr-2");
        var cardBody = document.createElement("div");
        cardBody.setAttribute("class", "card-body");
        var cardTitle = document.createElement("h6");
        cardTitle.textContent = "Date + " + eval(i + 1).toString();
        cardTitle.setAttribute("class", "card-title");
        var forecastIcon = document.createElement("img");
        forecastIcon.src = "http://openweathermap.org/img/wn/" + cityWeather.icon + "@2x.png";
        var forecastTemp = document.createElement("p")
        forecastTemp.textContent = "Temp: xx.xx ℉";
        var forecastHumidity = document.createElement("p");
        forecastHumidity.textContent = "Humidity: xx %";

        cardBody.append(cardTitle, forecastIcon, forecastTemp, forecastHumidity);
        cardContainer.appendChild(cardBody);
        weatherForecastEl.appendChild(cardContainer);
    }
// end of displayForecast Function
}
 



cityNameSubmitEl.addEventListener("submit", getCityName);




