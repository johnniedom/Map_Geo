'use strict';

// import L from './leaflet';
// import 'leaflet/dist/leaflet.css';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// map Type
const street = document.getElementById('streets')
const hybird = document.getElementById('hybrid')
const terrain = document.getElementById('terrain')



const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// console.log(navigator.geolocation);

// let map, mapEvent;

class App {
  #map;
  #mapEvent;

  constructor() {
    //  console.log(this);
    this._getPosition();
  }

  _getPosition() {
    if (navigator.geolocation) {
      // NOTE IN A ANY CALLBACK IS REGULAR FUNCTION AND THE THIS KEYWORD POINTS TO
      // UNDEFINE.
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`Could not get your position`);
        }
      );
    }
  }

  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},11.97z`);


    const coords = [latitude, longitude];

    // THis L is leaflet namespace
    this.#map = L.map('map').setView(coords, 13);
    console.log(this.#map);
    console.log(this)

    // Using Google map
//     L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
//       maxZoom: 20,
//       subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
//     }).addTo(this.#map);

//     L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
//     maxZoom: 20,
//     subdomains:['mt0','mt1','mt2','mt3']
// }).addTo(this.#map)

  //   L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
  //     maxZoom: 20,
  //     subdomains:['mt0','mt1','mt2','mt3']
  // }).addTo(this.#map)

    this.#map.on(`click`, function (mapE) {
      thi.#mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  mapType(lyrs) {
    return L.tileLayer(`http://{s}.google.com/vt/lyrs=${lyrs}&x={x}&y={y}&z={z}`, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
  }

  _showForm() {}

  _toggleElevation() {}
}

const appCreate = new App();
console.log(appCreate);
// app._getPosition;

form.addEventListener(`submit`, function (e) {
  e.preventDefault();
  // console.log(mapEvent);

  //clear input field
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
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

inputType.addEventListener(`change`, function () {
  inputElevation.closest(`form__row`).classList.toggle(`form__row--hidden`);
});
 