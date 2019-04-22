$(document).on("mobileinit", function() {
  $(function() {
   
    let city_name = $("<div>").attr("id", "city_name");
    let weather_icon = $("<img>").attr("id", "weather_icon");
    let temp = $("<div>").attr("id", "temp");
    let weather_main = $("<div>").attr("id", "weather_main");
    let temp_max = $("<div>").attr("id", "temp_max");
    let temp_min = $("<div>").attr("id", "temp_min");
    let humedad = $("<div>").attr("id", "humedad");
    let viento = $("<div>").attr("id", "viento");

    

    $(document).on("tap", ".ui-li-static", getInfo);

    $("#main_info").append(city_name);
    $("#main_info").append(weather_icon);
    $("#main_info").append(temp);
    $("#main_info").append(weather_main);

    $("#details").append(temp_max);
    $("#details").append(temp_min);
    $("#details").append(humedad);
    $("#details").append(viento);

    //    PARA QUE TE GEOLOCALICE NADA MÁS ABRAS LA APP.
    var jsonCities = localStorage.getItem("datos");
    $("#main").on("pageinit", function() {
      //PARA BORRAR TODAS LAS CIUDADES
      //he intentado hacerlo de manera individual pero ha habido un momento
      //en el que ha dejado de funcionarme el resto del código.

      $("#borrar").on("click", function(){
        localStorage.clear();
        location.reload();

      })
      localStorage.setItem("datos", jsonCities);

      if (jsonCities == null || jsonCities == undefined) {
        jsonCities = '{"ciudades":[]}';
       
        //GEOLOCALIZACIÓN
        navigator.geolocation.getCurrentPosition(successF, errorF);

        function successF(position) {
          let latit = position.coords.latitude;
          let long = position.coords.longitude;

          

          $.getJSON(
            "http://api.openweathermap.org/data/2.5/weather?lat=" +
              latit +
              "&lon=" +
              long +
              "&units=metric&appid=eb59ca759b92c62784f4e857fab320c9",

            function(resp) {
              let temperatura_max = resp.main.temp_max.toString();
              let temperatura_min = resp.main.temp_min.toString();
              let icono =
                "http://openweathermap.org/img/w/" +
                resp.weather[0].icon +
                ".png";
              city_name.html(resp.name);
              weather_icon.attr("src", icono);
              temp.html(resp.main.temp + "º");
              weather_main.html(resp.weather[0].main);

              temp_min.append(
                "<p class='big-type'>" + temperatura_min + "</p>"
              );
              temp_min.append("<p>temp min</p>");

              temp_max.append(
                "<p class='big-type'>" + temperatura_max + "</p>"
              );
              temp_max.append("<p>temp max</p>");

              humedad.append(
                "<p class='big-type'>" + resp.main.humidity + "</p>"
              );
              humedad.append("<p>Humedad</p>");
              viento.append("<p class='big-type'>" + resp.wind.speed + "</p>");
              viento.append("<p>Viento</p>");
              //alert("your latitude is"+latit+" and your long is"+ long);

              let nuevaCiudad = $("<li>").text(
                resp.name + ", " + resp.sys.country
              );
              nuevaCiudad.attr("class", "ui-li-static");
              nuevaCiudad.addClass("ui-body-inherit");
              $("#lista-tus-ciudades").append(nuevaCiudad);

              var parseJson = JSON.parse(jsonCities);
              parseJson["ciudades"].push({
                id: parseJson.ciudades.length,
                name: resp.name + ", " + resp.sys.country,
                latitude: latit,
                longitude: long
              });
              jsonCities = JSON.stringify(parseJson);
              localStorage.setItem("datos", jsonCities);
            }
          );
        }
        function errorF(position) {
          alert("error!");
        }
      } 

      else {
        jsonCities = localStorage.getItem("datos");

        parseandoJson = JSON.parse(jsonCities);
        

        for (i = 0; i < parseandoJson.ciudades.length; i++) {
          parseandoJson = JSON.parse(jsonCities);
          nuevaCiudad = $("<li>").text(parseandoJson.ciudades[i].name);
          nuevaCiudad.attr("class", "ui-li-static");
          nuevaCiudad.addClass("ui-body-inherit");
          $("#lista-tus-ciudades").append(nuevaCiudad);

          $.getJSON(
            "http://api.openweathermap.org/data/2.5/weather?lat=" +
              parseandoJson.ciudades[0].latitude +
              "&lon=" +
              parseandoJson.ciudades[0].longitude +
              "&units=metric&appid=eb59ca759b92c62784f4e857fab320c9",
              function(resp){
                let temperatura_max = resp.main.temp_max.toString();
                let temperatura_min = resp.main.temp_min.toString();
                let icono =
                  "http://openweathermap.org/img/w/" +
                  resp.weather[0].icon +
                  ".png";
                city_name.html(parseandoJson.ciudades[0].name);
                weather_icon.attr("src", icono);
                temp.html(resp.main.temp);
                weather_main.html(resp.weather[0].main);

                temp_min.html("<p>temp min<br></p>");
                temp_min.prepend(
                  "<p class='big-type'>" + temperatura_min + "</p>"
                );
                temp_max.html("<p>temp max<br></p>");
                temp_max.prepend(
                  "<p class='big-type'>" + temperatura_max + "</p>"
                );
                humedad.html(resp.main.humidity);
                viento.html(resp.wind.speed);

                humedad.html("<p>Humedad</p>");
                humedad.prepend(
                  "<p class='big-type'>" + resp.main.humidity + "</p>"
                );
                viento.html("<p>Viento</p>");
                viento.prepend(
                  "<p class='big-type'>" + resp.wind.speed + "</p>"
                );

              })

        }
      };

      //BUSCADOR QUE AUTOCOMPLETA LAS CIUDADES
      //DE LA API DE GOOGLE

      var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-33.8902, 151.1759),
        new google.maps.LatLng(-33.8474, 151.2631)
      );

      var input = document.getElementById("autocomp");
      var options = {
        bounds: defaultBounds,
        types: ["(cities)"]
      };

      autocomplete = new google.maps.places.Autocomplete(input, options);

      //      OBTENER LAS COORDENADAS DE LOS LUGARES QUE AÑADIMOS

      if ($("#añadir")) {
        //Este trozo lo he cogido de esta pregunta de stackoverflow
        //https://stackoverflow.com/questions/37357713/google-maps-geocoding-api-not-returning-lat-and-long
       
        let lat;
        let lon;
        var geocoder = new google.maps.Geocoder();
        
        
        $("#submit").on("click", function() {
          
          //En esta variable se almacena lo que hay escrito en la
          //barra buscadora
          let address = $("#autocomp").val();
          
          //El objeto geocode proporcionado por google nos permite
          //obtener las coordenadas (a parte de más datos) de los sitios que buscamos
          geocoder.geocode({ address: address }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {

              //esto nos devuelve únicamente las coordenadas
              lat = results[0].geometry.location.lat();
              lon = results[0].geometry.location.lng();
              

              //PARA OBTENER EL TIEMPO A PARTIR DE LAS COORDENADAS
              //pasamos las variables en las que se almacenan las coordenadas
              //por la url de la api

              $.getJSON(
                "http://api.openweathermap.org/data/2.5/weather?lat=" +
                  lat +
                  "&lon=" +
                  lon +
                  "&units=metric&appid=eb59ca759b92c62784f4e857fab320c9",

                function(resp) {
                  
                  if ($("#main")) {
                   

                    //Para pasar las temperaturas a string y no que las sume
                    let temperatura_max = resp.main.temp_max.toString();
                    let temperatura_min = resp.main.temp_min.toString();
                    let icono =
                      "http://openweathermap.org/img/w/" +
                      resp.weather[0].icon +
                      ".png";
                    city_name.html(address);
                    weather_icon.attr("src", icono);
                    temp.html(resp.main.temp);
                    weather_main.html(resp.weather[0].main);

                    temp_min.html("<p>temp min<br></p>");
                    temp_min.prepend(
                      "<p class='big-type'>" + temperatura_min + "</p>"
                    );
                    temp_max.html("<p>temp max<br></p>");
                    temp_max.prepend(
                      "<p class='big-type'>" + temperatura_max + "</p>"
                    );
                    humedad.html(resp.main.humidity);
                    viento.html(resp.wind.speed);

                    humedad.html("<p>Humedad</p>");
                    humedad.prepend(
                      "<p class='big-type'>" + resp.main.humidity + "</p>"
                    );
                    viento.html("<p>Viento</p>");
                    viento.prepend(
                      "<p class='big-type'>" + resp.wind.speed + "</p>"
                    );

                   

                    //ESTO LO HE SACADO DE AQUÍ
                    //https://stackoverflow.com/questions/18884840/adding-a-new-array-element-to-a-json-object/18884871
                    var parseJson = JSON.parse(jsonCities);
                    parseJson["ciudades"].push({
                      id: parseJson.ciudades.length,
                      name: address,
                      latitude: lat,
                      longitude: lon
                    });
                    jsonCities = JSON.stringify(parseJson);
                  
                    localStorage.setItem("datos", jsonCities);

                    
                    
                    //para pintar el li con el nombre de la ciudad
                    let nuevoLi = $(
                      "<li class='ui-li-static ui-body-inherit'>" +
                        parseJson.ciudades[parseJson.ciudades.length - 1].name +
                        "</li>"
                    );

                    $("#lista-tus-ciudades").append(nuevoLi);

                    //VER DATOS DE TUS CIUDADES

                    
                    //let aVer= parseJson.ciudades[jsonCities.ciudades.length];

                    $(document).on("click", ".ui-li-static", getInfo);
                  } //CIERRA EL IF(MAIN)

                  else {
                    nocoords = "Could not retrieve coordinates for: " + address;
                    
                  } //CIERRA EL ELSE
                  
                  //return coords;
                }
              ); //CIERRA EL REQUEST
            } //CIERRA EL STATUS
          }); //CIERRA EL GEOCODE
        }); //CIERRA EL SUBMIT
      }
    });

    function getInfo() {
      //coge el texto del LI en el que clicas
      
      parseandoCosas=JSON.parse(jsonCities).ciudades;

      function existe(parseandoCosas, key, val) {
        for (var i = 0; i < parseandoCosas.length; i++) {
            if(parseandoCosas[i][key] === val) {
              $.ajax({
                url:
                  //se concatena la latitud y longitud del LI con la url y nos permite
                  //obtener datos de la ciudad guardada
                  "http://api.openweathermap.org/data/2.5/weather?lat=" +
                  parseandoCosas[i].latitude +
                  "&lon=" +
                  parseandoCosas[i].longitude +
                  "&units=metric&appid=eb59ca759b92c62784f4e857fab320c9",
                type: "GET",
                dataType: "json"
              }).done(function(response) {
                let temperatura_max = response.main.temp_max.toString();
                let temperatura_min = response.main.temp_min.toString();
                let icono =
                  "http://openweathermap.org/img/w/" +
                  response.weather[0].icon +
                  ".png";
                
                city_name.html(
                  response.name + ", " + response.sys.country
                );
                weather_icon.attr("src", icono);
                temp.html(response.main.temp);
                weather_main.html(response.weather[0].main);
                temp_min.html("<p>temp min<br></p>");
                temp_min.prepend(
                  "<p class='big-type'>" + temperatura_min + "</p>"
                );
                temp_max.html("<p>temp max<br></p>");
                temp_max.prepend(
                  "<p class='big-type'>" + temperatura_max + "</p>"
                );
                humedad.html(response.main.humidity);
                viento.html(response.wind.speed);
        
                humedad.html("<p>Humedad</p>");
                humedad.prepend(
                  "<p class='big-type'>" +
                    response.main.humidity +
                    "</p>"
                );
                viento.html("<p>Viento</p>");
                viento.prepend(
                  "<p class='big-type'>" + response.wind.speed + "</p>"
                );
              });
            }
        }
        return false;
    }

      let ciudad= $(this).text();

      existe(parseandoCosas, "name",  ciudad);

      
    }
  });
});
