'use strict';

// const { map } = require("leaflet");

// import L from './leaflet';
// import 'leaflet/dist/leaflet.css';

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
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [7.9, 8.4]
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }  ${this.date.getDate()}`;
  }
}
console.log(Date.now() + '');
class Running extends WorkOut {
  type = `running`;
  constructor(coords, distance, duration, Cadence) {
    super(coords, distance, duration);
    this.Cadence = Cadence;
    this.calPace();
    this._setDescription();
  }

  calPace() {
    this.speed = this.duration / this.distance;
  }
}

class Cycling extends WorkOut {
  type = `cycling`;
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calSpeed();
    this._setDescription();
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
  #mapZoomLevel = 13;
  constructor() {
    // this;
    this._getPosition();

    // STORE DATA
   this._getLocalStorage()

    form.addEventListener(`submit`, this._newWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggleElevation);
    containerWorkouts.addEventListener(`click`, this._moveToPopup.bind(this));
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    mapBtn.addEventListener(`click`, this._mapTarget.bind(this));

    L.tileLayer(
      `http://{s}.google.com/vt/lyrs=${this.mapType}&x={x}&y={y}&z={z}`,
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    ).addTo(this.#map);

    this.#map.on(`click`, this._showForm.bind(this));

    this.#workout.forEach(work => {
      this.renderWorkOutMaker(work)
     })
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // console.log(mapE);
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //Clear input and Hide form
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = `none`;
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = `grid`), 1000);
  }

  _toggleElevation() {
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  _newWorkout(e) {
    e.preventDefault();

    const validInput = (...input) => input.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
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

      workout = new Running([lat, lng], distance, duration, cadence);
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
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    // Add new object to workout array
    this.#workout.push(workout);
    console.log(workout);

    // Render workout on Map as marker
    this.renderWorkOutMaker(workout);

    // Render workOut on list
    this._renderWorkout(workout);

    // clear and hide form
    this._hideForm();

    // ste Local storage ti all workout
    this._setLocalStorage();

    
  }

  renderWorkOutMaker(workout) {
    const point = workout.coords;
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
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title"> ${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">  ${
            workout.type === `running` ? `🏃‍♂️` : `🚴‍♀️`
          } </span>
          <span class="workout__value">5.2</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">min</span>
     </div>`;

    if (workout.type === `cycling`) {
      html += `  
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">>${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
    </li>
     `;
    }

    if (workout.type === `running`) {
      console.log(workout.type);
      console.log(workout);
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">4.6</span>
            <span class="workout__unit">min/km</span>
      </div> 
      <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
      </div>  
    </li> 
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(`.workout`);
    console.log(workoutEl);

    if (!workoutEl) return;

    console.log(this);
    const workouEll = this.#workout.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workouEll.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    // Local storage is an API provide by the by the browser
    //it take two arguments and the first agr is the NAME
    // local STORAGE IS BLOCKING
    localStorage.setItem(`workouts`, JSON.stringify(this.#workout));
  }

  _getLocalStorage() {
    // Converting it back to Object
    // this will not get access to the prototype chain.
    const data = JSON.parse(localStorage.getItem(`workouts`));

    this.#workout = data;

    console.log(this.#workout);
    this.#workout.forEach(work => {
     this._renderWorkout(work)
    })
  }
  render(){
    console.log(workout);
    localStorage.removeItem(workout)
    location.reload()
  }

}

const app = new App();
console.log(app);
console.log(app.render());

