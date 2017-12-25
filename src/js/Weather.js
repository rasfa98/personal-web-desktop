/**
 * Module for the weather application.
 *
 * @module src/js/Weather
 * @author Rasmus Falk
 * @version 1.0.0
 */

'use strict'

const DesktopWindow = require('./DesktopWindow')
const setup = require('./setup')

/**
 * Class representing a weather application.
 */
class Weather extends DesktopWindow {
  /**
   * Creates an instance of Weather.
   *
   * @param {string} title String of the relative URL for the application window icon.
   * @param {string} icon String of the title for the application window.
   * @memberof Weather
   */
  constructor (title, icon) {
    super()

    this.response = null
    this.url = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.068581/lat/59.329324/data.json'
    this.title = title
    this.icon = icon
    this.currentDay = undefined
    this.day = undefined
    this.weatherStatus = undefined
    this.dateObj = new Date()
    this.highestTemp = null
    this.lowestTemp = null
    this.hourCounter = 0
    this.counter = 0
  }

  /**
   * Creates a new weather window.
   */
  createWeatherWindow () {
    this.createWindow(this.title, this.icon)
    this.currentWindow.classList.add('weather')

    setup.editAppContent('#weather', this.currentWindow)

    this.currentWindow.querySelector('#controlls button').addEventListener('click', event => {
      this.changeLocation()
    })

    this.getData()
  }

  /**
   * Updates the choosen location.
   */
  changeLocation () {
    let selected = this.currentWindow.querySelector('select').value

    let long = selected.slice(0, 9)
    let lat = selected.slice(10)

    this.url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${long}/lat/${lat}/data.json`

    setup.editAppContent('#weatherReset', this.currentWindow)
    this.counter = 0
    this.hourCounter = 0
    this.getData()
    this.dateObj = new Date()
  }

  /**
   * Gets the data from the SMHI API.
   */
  getData () {
    setup.startLoading(this.currentWindow)

    window.fetch(this.url)
    .then(response => {
      return response.json()
    })
    .then(response => {
      this.response = response
      setup.stopLoading(this.currentWindow)

      this.calculateWeather()
    })
  }

  /**
   * Calculates the different temperatures etc.
   */
  calculateWeather () {
    this.dateObj.setDate(this.dateObj.getDate() + 1)
    this.currentDay = this.dateObj.getDay()

    let temps = []
    let responseTimes = []

    responseTimes = this.response.timeSeries.filter(current => {
      return parseInt(current.validTime.slice(8, 10)) === this.dateObj.getDate()
    })

    for (let i = 0; i < responseTimes.length; i++) {
      let parameters = responseTimes[i].parameters

      for (let j = 0; j < parameters.length; j++) {
        if (parameters[j].name === 't') {
          temps.push({time: responseTimes[i].validTime, value: parameters[j].values[0]})
        }

        if (parameters[j].name === 'Wsymb2') {
          temps[i].status = parameters[j].values[0]
        }
      }
    }

    temps.sort((a, b) => { return b.value - a.value })

    this.highestTemp = temps[0].value
    this.lowestTemp = temps[temps.length - 1].value

    this.checkCurrentWeatherTime(temps)
  }

  /**
   * Prints out the data to the screen.
   *
   * @param {number} temp The temperature closest to the current hour.
   */
  displayWeather (temp, weatherStatus) {
    this.getDayName()
    this.getStatus(weatherStatus)

    let template = document.querySelector('#weatherDay')
    let dayTemplate
    let content = this.currentWindow.querySelector('#content')

    dayTemplate = document.importNode(template.content, true)
    content.appendChild(dayTemplate)

    let day = this.currentWindow.querySelectorAll('#content h2')[this.counter]
    let highLow = this.currentWindow.querySelectorAll('#content p')[this.counter]
    let temperature = this.currentWindow.querySelectorAll('#content h1')[this.counter]
    let statusText = this.currentWindow.querySelectorAll('#content h3')[this.counter]

    day.textContent = this.day
    highLow.textContent = `${this.highestTemp}° / ${this.lowestTemp}°`
    temperature.textContent = `${temp}°`
    statusText.textContent = this.weatherStatus

    this.counter++

    if (this.counter < 5) {
      this.calculateWeather()
    }
  }

  /**
   * Gets the correct text for the specific day.
   */
  getDayName () {
    let nameOfDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    this.day = nameOfDays[this.currentDay - 1]
  }

  /**
   * Calculates the weather status text.
   *
   * @param {number} statusCode The number recived from the request.
   */
  getStatus (statusCode) {
    let weatherStatusList = ['Clear sky', 'Nearly clear sky', 'Variable cloudiness', 'Halfclear sky',
      'Cloudy sky', 'Overcast', 'Fog', 'Light rain showers', 'Moderate rain showers',
      'Heavy rain showers', 'Thunderstorm', 'Light sleet showers', 'Moderate sleet showers',
      'Heavy sleet showers', 'Light snow showers', 'Moderate snow showers', 'Heavy snow showers',
      'Light rain', 'Moderate rain', 'Heavy rain', 'Thunder', 'Light sleet', 'Moderate sleet',
      'Heavy sleet', 'Light snowfall', 'Moderate snowfall', 'Heavy snowfall']

    this.weatherStatus = weatherStatusList[statusCode - 1]
  }

  /**
   * Checks if the data has weather info that matches the closest hour.
   *
   * @param {object[]} temps Array of objects with temperatures and their closest time.
   */
  checkCurrentWeatherTime (temps) {
    let value = temps.filter(current => {
      let hours = this.dateObj.getHours() + this.hourCounter
      let dataHours = parseInt(current.time.slice(11, 13))

      return dataHours === hours
    })

    if (value.length === 0 && this.hourCounter !== 10) {
      this.hourCounter++
      this.checkCurrentWeatherTime(temps)
    } else if (this.hourCounter === 10) {
      this.hourCounter = 0
      let tempInfo = temps[temps.length - 1]
      this.displayWeather(tempInfo.value, tempInfo.status)
    } else {
      this.hourCounter = 0
      this.displayWeather(value[0].value, value[0].status)
    }
  }
}

// Exports
module.exports = Weather
