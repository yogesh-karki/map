mapboxgl.accessToken = "pk.eyJ1IjoieW9nZXNoa2Fya2kiLCJhIjoiY2txZXphNHNlMGNybDJ1cXVmeXFiZzB1eSJ9.A7dJUR4ppKJDKWZypF_0lA";
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: [84.6897, 28.4764],
    zoom: 7,
    setMaxBounds: [86.6897, 29.4764],
});

map.on("load", function () {
    map.addSource("cylinders", {
        type: "geojson",

        data: "./cylinder.geojson",
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 100,
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "cylinders",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": ["step", ["get", "point_count"], "#51bbd6", 100, "#f1f075", 750, "#f28cb1"],
            "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
        },
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "cylinders",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
        },
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "cylinders",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#11b4da",
            "circle-radius": 10,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
        },
    });

    // inspect a cluster on click
    map.on("click", "clusters", function (e) {

        var features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
        });
        var clusterId = features[0].properties.cluster_id;
        map.getSource("cylinders").getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
            });
        });
    });

    map.on("click", "unclustered-point", function (e) {


        var coordinates = e.features[0].geometry.coordinates.slice();

        var type = e.features[0].properties.type;
        var name = e.features[0].properties.name;
        var subType = e.features[0].properties.subtype;
        var address = e.features[0].properties.address;
        
        
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `
                <div class="info-card">
                    <div class="info-card-header">
                        <h4>${name}</h4>
                        <h6>${subType}</h6>
                        
                    </div>
            
                    <div class="info-desc">
                        
                    </div>
            
                </div>
                `

            )
            .addTo(map);

        console.log(name,address)
     
    });

    map.on("mouseenter", "clusters", function () {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", function () {
        map.getCanvas().style.cursor = "";
    });
});
