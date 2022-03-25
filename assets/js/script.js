// initialize variable to hold search history
var cities = [];

// constants
var uvFavorableLimit = 4;
var uvModerateLimit = 7;
var forecastDays = 5;
var historyLimit = 10;

// get latitude and longitude coordinates of city to use as input to One Call Open Weather API
var getCoordinates = function(city) {
    // format Geocoding api url
    var apiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=b382fc1462adf9eba28383207f67b071";

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
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=b382fc1462adf9eba28383207f67b071";

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
            // if not successful
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
    var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";
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
        // first instance of date does not appear until forecast cards. must start index at 0
        $(".date").eq(i-1).text(currentDate);
        // get weather icon code to create url to image source
        iconCode = data.daily[i].weather[0].icon;
        iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";
        $(".icon").eq(i).attr('src', iconUrl);

        // add current weather info to page
        $(".temperature").eq(i).text(data.daily[i].temp.day);
        $(".wind").eq(i).text(data.daily[i].wind_speed);
        $(".humidity").eq(i).text(data.daily[i].humidity);
    }

    // check if city is already in history
    // set city list and current city to lowercase for comparison
    var citiesLowerCase = cities.map(cityEl => {
        return cityEl.toLowerCase();
    })
    var cityLowerCase = city.toLowerCase();
    // only add to history and local storage if city is not already in history
    if (!citiesLowerCase.includes(cityLowerCase)) {
        addHistory(city);
    }
}

var addHistory = function(city) {
    // add city button to page
    var cityButton = $("<button>")
        .addClass("btn btn-history mt-3")
        .text(city);

    // if city history reaches the limit, remove oldest search result element
        if ($(".btn-history").length == historyLimit) {
        $(".btn-history").eq(0).remove();
    }

    // add new city button to end of city history list
    $(".city-history").append(cityButton);
    
    cities.push(city);
    
    // limit history length in local storage
    if (cities.length > historyLimit) {
        // if hit limit, remove oldest search
        cities = cities.slice(1, cities.length);
    }
    // set cities array in local storage
    localStorage.setItem("cities", JSON.stringify(cities));
}

// get city history from local storage and display history to page
var loadHistory = function() {
    for (i = 0; i < cities.length; i++) {
        // create a new button for saved city
      var cityButton = $("<button>")
        .addClass("btn btn-history mt-3")
        .text(cities[i]);
        // add button to end of city history list
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
    // get index of button clicked
    var buttonIndex = $(this).index();
    // run stored weather data for city through getCoordinates to get updated weather for city and display
    getCoordinates(cities[buttonIndex]); 
})

// if there are saved cities in the history, load to page
if (localStorage.getItem("cities")) {
    cities = JSON.parse(localStorage.getItem("cities"));
    loadHistory();
}