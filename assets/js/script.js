// constants
var uvFavorableLimit = 4;
var uvModerateLimit = 7;
var forecastDays = 5;

var getCoordinates = function(city) {
    // format Geocoding api url
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=b382fc1462adf9eba28383207f67b071";

    // make request to url
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    getCurrentWeather(data[0].lat, data[0].lon, city);
                })
            }
            else {
                alert("City not found! Enter a different city.")
            }
        })
}

var getCurrentWeather = function(lat, lon, city) {
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
    // get current date wrt city timezone
    var currentDate = moment().tz(data.timezone).format("M/DD/YYYY");
    // build city name, current date, icon to apply to page
    var cityInfo = city + " (" + currentDate + ") ";
    $("#city-info").text(cityInfo);
    var iconCode = data.current.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
    $("#current-icon").attr('src', iconUrl);

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
}

$(".btn-search").click(function() {
    var city = $(".form-control").val();
    // clear search form
    $(".form-control").val("");
    getCoordinates(city);
})