var cityNameSubmitEl = document.querySelector("#city-form");
var cityNameEl = document.querySelector("#city-name");
var weatherCurrentDayEl = document.querySelector("#weather-current-day");
var weatherForecastEl = document.querySelector("#weather-forecast");
var forecastHeaderEl = document.querySelector("#forecast-header");
var cityHistoryEl = document.querySelector("#city-history");

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
    idToRefresh.innerHTML = "";
}

// retrieves prior cities searched from localStorage
var getCityHistory = function(){

    var retrievedCities = localStorage.getItem("cities");
    var citiesArr = [];
    if (retrievedCities) {
        var citiesArr = retrievedCities.split(',');
    }
    return citiesArr;
};

// saves new city to localStorage if isn't already there
var saveCityHistory = function(cityName) {

    var foundCity = false;
    // search for city to see if alreay in cities array
    if (cities) {
        for (i = 0; i < cities.length; i++) {
            if ((cities[i] === cityWeather.name )) {
                foundCity = true;
            }
        }
    }
    // if city is not in cities array then save to localStorage
    if (!foundCity && cityWeather.name) {
        cities.push(cityWeather.name);
        localStorage.setItem("cities", cities);
    } 
};

// puts city search history on page
var displayCityHistory = function(cityHistory) {

    refresh(cityHistoryEl);
    if (cityHistory) {
        for (i =0; i < cityHistory.length; i++) {
            var cityListItem = document.createElement("li");
            cityListItem.id = "city-" + i.toString();
            cityListItem.setAttribute("class", "list-group-item list-group-item-light");
            cityListItem.textContent = cityHistory[i];
            cityListItem.addEventListener("click", function (event) {
                event.preventDefault();
                cleanStart();
                fetchCityWeather(event.target.textContent);
            })
            cityHistoryEl.appendChild(cityListItem);
        }
    }    
};

var cleanStart = function() {

    cityHistory = getCityHistory();
    displayCityHistory(cityHistory);
    cities=cityHistory;

    refresh(forecastHeaderEl);
    refresh(weatherForecastEl);
}

var getCityName = function (event) {

    event.preventDefault();
    
    cleanStart();

    var cityName = cityNameEl.value.trim();

    fetchCityWeather(cityName);
}

var initializeCityForecast = function() {
    cityForecast.forecastDate.length = 0;
    cityForecast.forecastTemp.length = 0;
    cityForecast.forecastHumidity.length = 0;
    cityForecast.forecastIcon.length = 0;
};

var fetchForecast = function () {
    // gets 5-day forecast
    var apiUrlForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityWeather.name + "&units=imperial&appid=36badb05283e47c914843551c2046d2d";
    fetch(apiUrlForecast).then(function (response) {
        return response.json();
    })
    .then(function(data) {

        initializeCityForecast();

        // capture forecasts 11am to 2pm  day + 1, 2, 3, 4, 5
        for (i = 0; i < data.list.length; i++) {
            //get forecast date in local time of city searched
            getForecastDate = moment.unix(data.list[i].dt).utcOffset(data.city.timezone / 3600);
            day = parseInt(getForecastDate.format("DD")) - parseInt(cityWeather.date.format("DD"));
            time = parseInt(getForecastDate.format("HH"));

            // capturing forecast mid-day the next day or current day
            if ((day>0 && time >= 11 && time < 14) || (cityForecast.forecastTemp.length === 4 && i === (data.list.length-1))) {
                cityForecast.forecastHumidity.push(data.list[i].main.humidity);
                cityForecast.forecastTemp.push(data.list[i].main.temp.toFixed(1));
                cityForecast.forecastDate.push(getForecastDate);
                cityForecast.forecastIcon.push(data.list[i].weather[0].icon);
            }
        }
        displayWeather();
        displayForecast();
    })
    .catch(function(error) {
        console.error(error);
        alert("Problem capturing 5-day forecast");
    });
// end of fetchForecast function
};

var fetchUvi = function () {
    
    // gets uv index
    var apiUrlUvi = "https://api.openweathermap.org/data/2.5/uvi?lat=" + cityWeather.coordLat + "&lon=" + cityWeather.coordLon + "&appid=36badb05283e47c914843551c2046d2d";
    fetch(apiUrlUvi).then(function (response) {
        return response.json();
    })
    .then(function (data) {
        
        cityWeather.uvi = data.value;

        fetchForecast();
    })
    .catch(function(error) {
        console.error(error);
        alert("Problem capturing UVI");
    });
// end of fetchUvi function
};

var fetchCityWeather = function (cityName, cities) {
    var apiUrlWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=36badb05283e47c914843551c2046d2d";
    
    // fetch current weather
    fetch(apiUrlWeather).then(function (response) {
        return response.json();
    })
    .then(function(data) {

        cityWeather.name = data.name;
        cityWeather.temp = data.main.temp.toFixed(1);
        cityWeather.humidity = data.main.humidity;
        cityWeather.windSpeed = data.wind.speed.toFixed(1);
        cityWeather.icon = data.weather[0].icon;
        cityWeather.coordLon = data.coord.lon;
        cityWeather.coordLat = data.coord.lat;
        // get date in local time of city searched
        cityWeather.date = moment(data.date).utcOffset(data.timezone / 3600);
        
        saveCityHistory(cityName);

        fetchUvi();
    })
    .catch(function(error) {
        //console.log(error);
        console.error(error);
        alert("Unable to find city. Please check your spelling or try another city.")
    });
// end getCityWeather function      
};

var displayWeather = function () {
    refresh(weatherCurrentDayEl);
    refresh(forecastHeaderEl);
    refresh(weatherForecastEl);

    var currentWeatherBox = document.createElement("div");
    currentWeatherBox.id = "weather-current-day-box";

    var cityNameContainer = document.createElement("div");
    cityNameContainer.id = "city-name-container";
    cityNameContainer.setAttribute("class", "d-flex");

    var cityName = document.createElement("h3");
    cityName.textContent = cityWeather.name + " (" + cityWeather.date.format("MM/DD/YYYY") + ")";
    cityName.id = "city-name";
    // cityName.setAttribute("class", "col-6");

    var cityIcon = document.createElement("img");
    cityIcon.src = "http://openweathermap.org/img/wn/" + cityWeather.icon + "@2x.png";
    // cityIcon.setAttribute("class", "col-2");

    cityNameContainer.append(cityName, cityIcon);

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
    } else if (cityWeather.uvi < + 5) {
        cityUvIndexColor.id = "uv-index-moderate";
    } else if (cityWeather.uvi >= 6) {
        cityUvIndexColor.id = "uv-index-severe";
    }
    cityUvIndex.appendChild(cityUvIndexColor);

    currentWeatherBox.append(cityNameContainer, cityTemperature, cityHumidity, cityWindSpeed, cityUvIndex)

    weatherCurrentDayEl.appendChild(currentWeatherBox);

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