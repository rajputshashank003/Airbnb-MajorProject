    var find = locationFind;

    var map, searchManager;   
    function GetMap() {
        map = new Microsoft.Maps.Map('#myMap', { 
            zoom : 5,
        });
        //Make a request to geocode New York, NY.
        geocodeQuery(find);
    }

    function geocodeQuery(query) {
        //If search manager is not defined, load the search module.
        if (!searchManager) {
            //Create an instance of the search manager and call the geocodeQuery function again.
            Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
                searchManager = new Microsoft.Maps.Search.SearchManager(map);
                geocodeQuery(query);
            });
        } else {
            var searchRequest = {
                where: query,
                callback: function (r) {
                    //Add the first result to the map and zoom into it.
                    if (r && r.results && r.results.length > 0) {
                        console.log(r.results[0].location);
                        var pin = new Microsoft.Maps.Pushpin(r.results[0].location , {
                            color : 'red',
                        });

                        var infobox = new Microsoft.Maps.Infobox(r.results[0].location, { 
                            title: locationTitle, 
                            description : "Exact location will be provided after booking", 
                            visible: false 
                        });
                        infobox.setMap(map);
                        Microsoft.Maps.Events.addHandler(pin, 'mouseover', function (e) {
                            e.target.setOptions({ color: "blue" });
                            infobox.setOptions({ visible: true });
                        });

                        Microsoft.Maps.Events.addHandler(pin, 'mouseout', function (e) {
                            // Remove the infobox from the map.
                            e.target.setOptions({ color: "red" });
                            infobox.setOptions({ visible: false });
                          });

                        map.entities.push(pin);
                        map.setView({ bounds: r.results[0].bestView });
                    }
                },
                errorCallback: function (e) {
                    //If there is an error, alert the user about it.
                    alert("No results found.");
                }
            };
            //Make the geocode request.
            searchManager.geocode(searchRequest);
        }
    }