$(document).ready(function() {
  var farenheitToCelsius = function(temp) {
    return (temp - 32) * 5 / 9;
  };
  var celsiusToFarenheit = function(temp) {
    return (temp * 9 / 5) + 32;
  };
  var attachDegree = function() {
    $('.temp').each(function(index) {
      this.innerHTML += '°';
    });
  }
  var createDom = function(forecast, location) {
    var doc = document.createElement('div');
    doc.innerHTML = '<div id="weather" class="center"><p style="color:black;font-size:20px;"> F &nbsp&nbsp&nbsp C </p>' +
      '<label class="switch" style="color:black;">' +
      '<input id="switch" type="checkbox">F' +
      '<div class="slider"></div>' +
      '</label>' +
      '<div id="location" class="day"> </div>' +
      '<div id ="today" class="daily forecast">' +
      '<canvas id="icon0" width="128" height="128">' +
      '</canvas>' +
      '<div id="todaysTemp" class="temp"></div>' +
      '</div></div>';

    document.body.appendChild(doc);
    var skycons = new Skycons({
      "color": "black"
    });
    var address = '';
    if (location.results.length > 1) {
      address = location.results[1].formatted_address.split(',')
        //address = address[0] + address[1];
    } else {
      address = location.results[0].formatted_address.split(',')
        //address = address[0] + address[1];
    }
    $('#location').html('<div class="today"> Today\'s weather in ' + address + '</div>')
    var forecastArr = [{
      day: String(new Date(forecast.currently.time * 1000)).slice(0, 3),
      date: new Date(forecast.currently.time * 1000),
      current: Math.round(forecast.currently.apparentTemperature),
      high: Math.round(forecast.daily.data[0].temperatureMax),
      low: Math.round(forecast.daily.data[0].temperatureMin),
      icon: forecast.daily.data[0].icon,
      summary: forecast.daily.data[0].summary
    }];
    for (var i = 1; i < forecast.daily.data.length; i++) {
      var date = new Date(forecast.daily.data[i].time * 1000);
      var day = String(date).slice(0, 3);
      forecastArr.push({
        day: day,
        date: date,
        high: Math.round(forecast.daily.data[i].temperatureMax),
        low: Math.round(forecast.daily.data[i].temperatureMin),
        icon: forecast.daily.data[i].icon,
        summary: forecast.daily.data[i].summary
      });
    }
    for (var i = 1; i < forecastArr.length; i++) {
      var element = document.createElement('div');
      element.innerHTML += '<div class="forecast weekly"> <div class="day"> ' + forecastArr[i].day + '</div>' +
        '<canvas class="tempIcon" id="icon' + i + '" width="64" height="64"></canvas>' +
        '<div id="temp' + i + '">' + '<div class="high temp">' + forecastArr[i].high + '</div>' + '<div class="low temp">' + forecastArr[i].low + '</div></div>'
      '</div>';
      $('#weather').append(element);
      skycons.add("icon" + i, forecastArr[i].icon);
    }
    var el = document.getElementById('today');
    el.innerHTML += '<div class="day">' + forecastArr[0].day + '</div>';
    $('#todaysTemp').html(Math.round(forecastArr[0].current));
    skycons.add("icon0", forecastArr[0].icon);
    skycons.play();
    attachDegree();
  };

  var getWeather = function(zipOrCoor) {
    if (zipOrCoor.hasOwnProperty('coordinates')) {
      var coords = zipOrCoor['coordinates'].split(",")
      var lat = Math.floor(coords[0]);
      var long = Math.floor(coords[1]);
      $.ajax({
        url: 'https://api.darksky.net/forecast/3b4300ed533d507a05d3f499ff0007d6/' + lat + ',' + long,
        type: 'POST',
        dataType: 'jsonp',
        success: function(data) {
          var weather = data;
          $.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '&key=AIzaSyASlK8A2vZi_oggLa8QKAxWry8XYCPCxmM',
            type: 'POST',
            success: function(data) {
              var location = data;
              createDom(weather, location);
            }
          });
        }
      });
    } else if (zipOrCoor.hasOwnProperty('zipcode')) {
      console.log('zip');
      var zipcode = zipOrCoor['zipcode'];
      $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + zipcode + '&key=AIzaSyASlK8A2vZi_oggLa8QKAxWry8XYCPCxmM',
        type: 'POST',
        success: function(data) {
          var location = data;
          console.log('data', data)
          var coords = data.results[0].geometry.location;
          var lat = coords.lat;
          var long = coords.lng;
          $.ajax({
            url: 'https://api.darksky.net/forecast/3b4300ed533d507a05d3f499ff0007d6/' + lat + ',' + long,
            type: 'POST',
            dataType: 'jsonp',
            success: function(data) {
              var weather = data;
              createDom(weather, location);
            }
          });
        }
      });
    }
  }

  $('.button').click(function() {
    if (!$('#weather').length && $('#zipcode').val()) {
      $('#form').animate({
        'margin-top': '-=200px'
      }, 'slow');
    }
    $('#weather').remove();
  })

  $('#zipcodeButton').click(function() {
    var zipcode = {
      'zipcode': $('#zipcode').val()
    };
    console.log(zipcode)
    if (!zipcode['zipcode']) {
      alert('Please enter a zipcode.');
    } else {
      getWeather(zipcode);
    }
  })
  $('#mylocation').click(function() {
    $.getJSON("http://ipinfo.io/json", function(data) {
      var coordinates = {
        'coordinates': data.loc
      };
      getWeather(coordinates);
    });
  })

  $(document.body).on('click', '#switch', function() {
    console.log('switch')
    var highs = document.getElementsByClassName('high');
    var lows = document.getElementsByClassName('low');
    var current = document.getElementById('todaysTemp');
    if ($('#switch').prop('checked')) {
      current.innerHTML = Math.round(farenheitToCelsius(current.innerHTML.replace('°', '')));
    } else {
      current.innerHTML = Math.round(celsiusToFarenheit(current.innerHTML.replace('°', '')));
    }
    for (var i = 0; i < highs.length; i++) {
      if ($('#switch').prop('checked')) {
        highs[i].innerHTML = Math.round(farenheitToCelsius(highs[i].innerHTML.replace('°', '')));
        lows[i].innerHTML = Math.round(farenheitToCelsius(lows[i].innerHTML.replace('°', '')));
      } else {
        highs[i].innerHTML = Math.round(celsiusToFarenheit(highs[i].innerHTML.replace('°', '')));
        lows[i].innerHTML = Math.round(celsiusToFarenheit(lows[i].innerHTML.replace('°', '')));
      }
    }
    attachDegree();
  });

});