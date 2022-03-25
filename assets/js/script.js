var cityWeather = {
    city: [],
    weather: []
};

// constants
var uvFavorableLimit = 4;
var uvModerateLimit = 7;
var forecastDays = 5;
var historyLimit = 10;

var getCoordinates = function(city) {
    // format Geocoding api url
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=b382fc1462adf9eba28383207f67b071";

    // make request to url
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    getWeather(data[0].lat, data[0].lon, city);
                })
            }
            else {
                alert("City not found! Enter a different city.")
            }
        })
}

var getWeather = function(lat, lon, city) {
    // format openWeather api url
    var apiUrl = "http://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=b382fc1462adf9eba28383207f67b071";

    // make request to url
    fetch(apiUrl)
        .then(function(response) {
            // if response was successful
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    displayWeather(data, city);
                })
            }
            else {
                alert("Weather data not available")
            }
        })
        .catch(function(error) {
            alert("Unable to connect to OpenWeather");
        });
};

var displayWeather = function(data, city) {
    // set visibility of city weather html
    $("#city-weather").show();

    // print items unique to current weather to page
    // build city name, current date, icon to apply to page
    var currentDate = moment.unix(data.current.dt).tz(data.timezone).format("M/DD/YYYY");
    var cityInfo = city + " (" + currentDate + ") ";
    $("#city-info").text(cityInfo);
    var iconCode = data.current.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
    $(".icon").eq(0).attr('src', iconUrl);

    // add current weather info to page
    $(".temperature").eq(0).text(data.current.temp);
    $(".wind").eq(0).text(data.current.wind_speed);
    $(".humidity").eq(0).text(data.current.humidity);
    $(".uv").eq(0).text(data.current.uvi);

    // overwrite all classes with class uv to style based on uv index severity
    if (data.current.uvi < uvFavorableLimit) {
        $(".uv").eq(0).attr("class", "uv uv-favorable");
    }
    else if (data.current.uvi < uvModerateLimit) {
        $(".uv").eq(0).attr("class", "uv uv-moderate");
    }
    else {
        $(".uv").eq(0).attr("class", "uv uv-severe");
    }

    // daily forecast object starts with current day at 0 index. for future forecast, start index at 1
    for (i = 1; i < forecastDays + 1; i++) {
        console.log(i)
        // get date wrt city timezone
        currentDate = moment.unix(data.daily[i].dt).tz(data.timezone).format("M/DD/YYYY");
        console.log(currentDate)
        $(".date").eq(i-1).text(currentDate);
        iconCode = data.daily[i].weather[0].icon;
        iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
        $(".icon").eq(i).attr('src', iconUrl);

        // add current weather info to page
        $(".temperature").eq(i).text(data.daily[i].temp.day);
        $(".wind").eq(i).text(data.daily[i].wind_speed);
        $(".humidity").eq(i).text(data.daily[i].humidity);
    }

    addHistory(data, city);
}

var addHistory = function(data, city) {
    // add city button to page
    var cityButton = $("<button>")
        .addClass("btn btn-history mt-3")
        .text(city);

    // if city history reaches the limit, remove oldest search result element
        if ($(".btn-history").length == historyLimit) {
        $(".btn-history").eq(0).remove();
    }

    $(".city-history").append(cityButton);
    
    cityWeather.city.push(city);
    cityWeather.weather.push(data);
    // limit history length in local storage
    if (cityWeather > historyLimit) {
        // if hit limit, remove oldest search
        cityWeather = cityWeather.slice(1, cityWeather.length);
    }
    localStorage.setItem("cityWeather", JSON.stringify(cityWeather));
}

var loadHistory = function() {
    for (i = 0; i < cityWeather.city.length; i++) {
      var cityButton = $("<button>")
        .addClass("btn btn-history mt-3")
        .text(cityWeather.city[i]);

        $(".city-history").append(cityButton);  
    }
}

// search button clicked
$(".btn-search").click(function() {
    var city = $(".form-control").val();
    // clear search form
    $(".form-control").val("");
    getCoordinates(city);
})

// city button clicked in history list
$(".city-history").on("click", "button", function() {
    var buttonIndex = $(this).index();
    console.log(buttonIndex)
})

if (localStorage.getItem("cityWeather")) {
    cityWeather = JSON.parse(localStorage.getItem("cityWeather"));
    loadHistory();
}