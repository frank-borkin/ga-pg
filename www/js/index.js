var me;
var map;
var marker;
var markers = [];
var lat;
var lon;

function getData()
{
    var o = {};
    var positions = [];
    o.lat = lat; 
    o.lon = lon;
    o.causes = $( "#causes" ).val() || [];
    o.items = $( "#items" ).val() || [];

    //Quick AJAX call
    $.getJSON("https://www.give-anywhere.xyz/service.php",o).done(function( data ) {
        //Remove markers from the page
        for (var m = 0; m < markers.length; m++) {
            markers[m].setMap(null);
        }

        //Then clean the references to them
        while(markers.length > 0)
        {
            markers.pop();
        }

        //Now create a new position and marker for each entry in the result
        $.each( data, function( i, point )
               {
            var pos = new google.maps.LatLng(point.lat,point.lon);
            positions.push(pos);
            marker = new google.maps.Marker({ position: pos, map: map, title: point.name, icon: 'img/'+point.type+'.png' });
            markers.push(marker);
            data[i].dis = (data[i].distance/1000).toFixed(1);
        });

        //  Create a new viewpoint bound
        var bounds = new google.maps.LatLngBounds ();
        //Show myself
        bounds.extend(me);
        //  Go through .the other markers...
        for (var i = 0; i < markers.length; i++) {
            //  And increase the bounds to take this point
            bounds.extend (positions[i]);
        }
        //  Fit these bounds to the map
        map.fitBounds (bounds);

        //Update the accordion
        $("#accordion").empty();
        $.each( data, function( i, point )
               {
            $("#accordion").append('<div class="panel panel-default"><div class="panel-heading" style="height: 50px; line-height: 50px; position: relative; vertical-align: middle; padding: 0 0 0 15px;" role="tab" id="heading'+i+'"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'"><span class="panel-title" id="panel'+i+'">'+point.name+' ('+point.dis+' km)</span></a></div><div id="collapse'+i+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading'+i+'"><div class="panel-body">'+point.desc+'<hr><strong>Looking for:</strong><br>'+point.want+'<br><strong>Current Status:</strong><br>'+point.havetxt+'<br><div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="'+point.wantpc+'" aria-valuemin="0" aria-valuemax="100" style="width: '+point.wantpc+'%;">'+point.wantpc+'%</div></div></div></div></div>');
            $("#heading"+i).append('<ul id="list'+i+'" style="padding: 0; margin: 0; list-style-type: none; float: right; line-height: 50px; overflow: hidden;"></ul>');
            $("#list"+i).append('<li style="float: right"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'" style="display: block; width: 50px; background-color: #dddddd; text-align: center"><i class="fa fa-chevron-down"></i></a></li>');
            $("#list"+i).append('<li style="float: right"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'" style="display: block; width: 50px;"><img src="img/'+point.type+'_big.png" height="40"></a></li>');

        });
    });
}

function onErrorGeo(error) {  
    $.getJSON("https://www.give-anywhere.xyz/geo.php").done(function( data ) {
        lat = data.lat;
        lon = data.lng;
        me = new google.maps.LatLng(lat, lon);
        map.setCenter(me);
        marker = new google.maps.Marker({ position: me, map: map, title: 'Me' });
        getData();
    });
}

function onSucGeo(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    me = new google.maps.LatLng(lat, lon);
    map.setCenter(me);
    marker = new google.maps.Marker({ position: me, map: map, title: 'Me' });
    getData();
}

function main() {
    var mapOptions = { disableDefaultUI: true, zoom: 6, styles: [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}] };
    $( "#causes" ).change(getData);
    $( "#items" ).change(getData);
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    navigator.geolocation.getCurrentPosition(onSucGeo, onErrorGeo, {timeout: 10000, enableHighAccuracy: true });
}

document.addEventListener("deviceready", main, false);
