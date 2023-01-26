'use strict';

// import L from './leaflet';
// import 'leaflet/dist/leaflet.css';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

console.log(navigator.geolocation);

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(latitude);
      console.log(longitude);
      console.log(
        `https://www.google.com/maps/@${latitude},${longitude},11.97z`
      );

      const coords = [latitude, longitude];

      // THis L is leaflet namespace
      const map = L.map('map').setView(coords, 13);
      console.log(map);

      // Using Google map
      L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
      //   maxZoom: 20,
      //   subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      // }).addTo(mappoint, );

      // googleStreets.addTo(map);

      map.on(`click`, function (mapEvent) {
        const { lat, lng } = mapEvent.latlng;
        const point = [lat, lng];
        // console.log(mapEvent)
        L.marker(point, {
          riseOnHover: true,
          // draggable	: true
        })
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `running-popup`,
            })
          )
          .setPopupContent(`WorkOut`)
          .openPopup();
      });
    },
    function () {
      alert(`Could not get your position`);
    }
  );
}
/**icon: L.icon({
        iconUrl: 'my-icon.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    }), */
