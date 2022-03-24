var getCoordinates = function(city) {
    // format Geocoding api url
    var apiUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=b382fc1462adf9eba28383207f67b071";

    // make request to url
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    getCurrentWeather(data[0].lat, data[0].lon);
                })
            }
            else {
                alert("City not found! Enter a different city.")
            }
        })
}

var getCurrentWeather = function(lat, lon) {
    // format openWeather api url
    var apiUrl = "http://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=b382fc1462adf9eba28383207f67b071";

    // make request to url
    fetch(apiUrl)
        .then(function(response) {
            // if response was successful
            if (response.ok) {
                response.json().then(function(data) {
                    console.log(data);
                    displayWeather(data);
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

var displayWeather = function(data) {

}

$(".btn-search").click(function() {
    var city = $(".form-control").val();
    // clear search form
    $(".form-control").val("");
    getCoordinates(city);
})