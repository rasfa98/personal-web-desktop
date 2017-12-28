/**
 * Module for the desktop dock WebComponent.
 *
 * @module src/js/desktop-dock
 * @author Rasmus Falk
 * @version 1.0.0
 */

 'use strict'

 const template = document.createElement('template')
 const Memory = require('./Memory')
 const Settings = require('./Settings')
 const Chat = require('./Chat')
 const Weather = require('./Weather')
 const setup = require('./setup')
 const PhotoBooth = require('./PhotoBooth')

 template.innerHTML = `
 <style>
   :host {
       position: fixed;
       bottom: 0px;
       width: 100%;
    }

   :host ul {
       margin: 0px;
       padding: 0px;
       text-align: center;
   }

   :host li {
       display: inline-block;
       padding: 10px;
   }
 </style>

 <ul id="dock">
   <li id="memory"><a href="#"><image src="/image/icons/game.png"></a></li>
   <li id="chat"><a href="#"><img src="/image/icons/chat.png"></a></li>
   <li id="weather"><a href="#"><img src="/image/icons/weather.png"></a></li>
   <li id="camera"><a href="#"><img src="/image/icons/camera.png"></a></li>
   <li id="settings"><a href="#"><img src="/image/icons/settings.png"></a></li>
   <li id="trash"><a href="#"><img src="/image/icons/trash.png"></a></li>
 </ul>
`

 /**
  * Class representing a desktop dock.
  */
 class Dock extends window.HTMLElement {
  /**
   * Creates an instance of Dock.
   *
   * @memberof Dock
   */
   constructor () {
     super()
     this.attachShadow({mode: 'open'})
     this.shadowRoot.appendChild(template.content.cloneNode(true))
   }

   /**
    * The code that runs when the element is added to the DOM.
    */
   connectedCallback () {
     setup.setupWindows()

     this.shadowRoot.addEventListener('click', event => {
       if (event.target.closest('li').id === 'memory') {
         new Memory('Memory', '/image/icons/game.png').createMemoryWindow()
       } else if (event.target.closest('li').id === 'chat') {
         new Chat('Chat', '/image/icons/chat.png').createChatWindow()
       } else if (event.target.closest('li').id === 'settings') {
         new Settings('Settings', '/image/icons/settings.png').createSettingsWindow()
       } else if (event.target.closest('li').id === 'weather') {
         new Weather('Weather', '/image/icons/weather.png').createWeatherWindow()
       } else if (event.target.closest('li').id === 'trash') {
         setup.clearDesktop()
       } else if (event.target.closest('li').id === 'camera') {
         new PhotoBooth('Photo Booth', '/image/icons/camera.png').createPhotoBoothWindow()
       }
     })
   }
 }

 window.customElements.define('desktop-dock', Dock)

 // Exports
 module.exports = Dock
