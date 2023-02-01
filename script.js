'use strict';

// const { map } = require("leaflet");

// import L from './leaflet';
// import 'leaflet/dist/leaflet.css';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// map Type
// const mapBtn = document.querySelector(`.map__change`)
// const street = document.getElementById('streets')
// const hybird = document.getElementById('hybrid')
// const terrain = document.getElementById('terrain')

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// console.log(navigator.geolocation);

// let map, mapEvent;
const mapBtn = document.querySelector(`.map__change`);

class WorkOut {
  date = new Date();
  id = (new Date() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [7.9, 8.4]
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends WorkOut {
  constructor(coords, distance, duration, Cadence) {
    super(coords, distance, duration);
    this.Cadence = Cadence;
    this.calPace();
  }

  calPace() {
    this.speed = this.duration / this.distance;
  }
}

class Cycling extends WorkOut {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calSpeed();
  }
  calSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

//////////////////////////////////////////////////////////////
//APPLICATION ARCHITECTURE
class App {
  #map;
  #mapEvent;
  mapType = 'p';
  #workout = [];
  constructor() {
    // this;
    this._getPosition();
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggleElevation);
  }

  _mapTarget(e) {
    e.preventDefault();

    console.log(mapBtn, this);
    mapBtn.childNodes.forEach(el => {
      if (el.classList && el.classList.contains(`btn_map`)) {
        el.addEventListener(`click`, this._changeMap.bind(this));
      }
    });
    // console.log(this._mapTarget.bind(this));
    //   this.childNodes.forEach(el => {
    //   if (el.classList && el.classList.contains(`btn_map`)) {
    //     // el.addEventListener(`click`, this._mapTarget.bind(this));
    //   }
    // });
  }

  _changeMap(e) {
    console.log(e.target.dataset.map);
    console.log(this);
    this.mapType = e.target.dataset.map;
    return this.mapType;
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
    console.log(this);

    const coords = [latitude, longitude];

    // THis L is leaflet namespace
    this.#map = L.map('map').setView(coords, 13);

    // Using Google map
    // let type = this.mapType || `s,h`;
    mapBtn.addEventListener(`click`, this._mapTarget.bind(this));

    L.tileLayer(
      `http://{s}.google.com/vt/lyrs=${this.mapType}&x={x}&y={y}&z={z}`,
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    ).addTo(this.#map);

    this.#map.on(`click`, this._showForm.bind(this));
  }

  // _setupMapBtn(){
  //  this;
  // }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // console.log(mapE);
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevation() {
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    e.preventDefault();

    const validInput = (...input) => input.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => input.every(inp => inp > 0);
    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //check if data is valid

    //if workout running, create run object
    if (type === `running`) {
      const cadence = +inputCadence.value;
      //check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration)
      ) {
        return alert(`Input Has to be a Number`);
      }
    }
    //if workout cycling, create cycle object
    if (type === `cycling`) {
      const elevation = +inputElevation.value;
      //check if data is valid
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert(`Input Has to be a Number`);
      }
      workout = new Running([lat, lng], 50, 20, 50);
    }
    // Add new object to workout array

    // Render workout on Map as marker

    const point = [lat, lng];
    // console.log(mapEvent)
    L.marker(point, {
      riseOnHover: true,
      // draggable	: true
    })
      .addTo(this.#map)
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

    //Clear input and Hide form
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
}

/*
Hybrid: s,h;
Satellite: s;
Streets: m;
Terrain: p;
*/
const app = new App();
console.log(app);
// console.log(app._loadMap);
// street.addEventListener(`click`, function(e){
// //   const mainBtn = e.target.closest('.map__change')
// //  console.log(e);
// //  console.log( mainBtn);
// //  const bnts = mainBtn.querySelectorAll(`.btn_map`)

//  console.log(e.target.dataset.map);
//  const mapType = e.target.dataset.map
//  new App(mapType)
// })

console.log(mapBtn);
// console.log(mapBtn.childNodes);
// mapBtn.childNodes.forEach(el => {
//   if( el.classList.contains(`btn_map`))
//     console.log(el);
//   });

// new App(mapType);

// mapBtn.addEventListener(`click`, function(){
//  console.log();
// })

// mapBtn.childNodes.forEach(el => {
//   if (el.classList && el.classList.contains(`btn_map`)) {
//     el.addEventListener(`click`, function(e){
//       const mapType = e.target.dataset.map
//       new App(mapType);
//       el.classList.add(`hidden`)
//     })
//   }
// })

// console.log(app);
