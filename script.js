function saveGeoJSON(geojson) {
    var jsonString = JSON.stringify(geojson, null, 2);
    var blob = new Blob([jsonString], { type: 'application/json' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'StuporMundi.geojson';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadGeoJSON() {
    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            var geojson = {
                type: 'FeatureCollection',
                features: data.elements.map(function (item) {
                    return {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                        },
                        properties: {
                            name: item.tags.name,
                            descrizione: item.tags.information,
                            tipo: item.tags.tourism
                        }
                    };
                })
            };

            saveGeoJSON(geojson);
        })
        .catch(error => console.error('Errore nella richiesta a Overpass API:', error));
}

var map = L.map('map').setView([41.8719, 12.5674], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];area[name="Puglia"]->.a;node(area.a)[tourism];out;';

fetch(overpassUrl)
    .then(response => response.json())
    .then(data => {
        var geojson = {
            type: 'FeatureCollection',
            features: data.elements.map(function (item) {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                    },
                    properties: {
                        name: item.tags.name,
                        descrizione: item.tags.information,
                        tipo: item.tags.tourism
                    }
                };
            })
        };

        var markers = L.markerClusterGroup();

        L.geoJSON(geojson, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>' + feature.properties.name + '</b>, ' + feature.properties.tipo + '<br>' + feature.properties.descrizione);
            }
        }).addTo(markers);

        map.addLayer(markers);
    })
    .catch(error => console.error('Errore nella richiesta a Overpass API:', error));