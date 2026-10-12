;(function () {
  const mapEl = document.getElementById("map")
  if (!mapEl || typeof campground === "undefined" || !campground.geometry)
    return

  maptilersdk.config.apiKey = maptilerApiKey

  const showMap = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREETS,
    center: campground.geometry.coordinates,
    zoom: 10,
  })

  new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
      new maptilersdk.Popup({ offset: 25 }).setHTML(
        `<h6>${campground.title}</h6><p>${campground.location}</p>`,
      ),
    )
    .addTo(showMap)
})()
