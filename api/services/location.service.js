let mongoose = require('mongoose')
mongoose.Promise = Promise
let config = require('../config')
let bluebird = require("bluebird")
let geocoderProvider = 'google'
let httpAdapter = 'http'
let geocoder = require('node-geocoder')(geocoderProvider, httpAdapter)
let Region = mongoose.model('Region')
let Address = mongoose.model('Address')
let Location = mongoose.model('Location')
let querystring = require('querystring')
let rp = require('request-promise');
import { promiseWhile } from './promise.service'

export function getOrCreateRegion(city) {
  return new Promise((resolve, reject) => {

    let cityLookupString = city.name + ', ' + city.country.name
    var RateLimiter = require('limiter').RateLimiter;
    var limiter = new RateLimiter(1, 250);

    limiter.removeTokens(1, function() {
      geocoder.geocode(cityLookupString)
        .then(function (res) {
          console.log('geocoding ', cityLookupString);
          if (!res || !res[0] || !res[0]['administrativeLevels'] || !res[0]['administrativeLevels']['level1long']) {
            console.log('nope1', res[0]['administrativeLevels']['level1long']);
            return resolve()
          }
          let regionShortName = res[0]['administrativeLevels']['level1short']
          let regionLongName = res[0]['administrativeLevels']['level1long']
          Region.findOne({longName: regionLongName}).then(region => {
            if (region) {
              console.log('rgion found', region);
              return resolve(region)
            }
            let newRegion = {shortName: regionShortName, longName: regionLongName, country: city.country._id}
            Region.create(newRegion).then((region) => {
              console.log('newRegion', region)

              return resolve(region)
            }).catch((err) => {
              console.log('2', err);
              return reject(err);
            })
          }).catch((err) => {
            console.log('region', err)
            reject(err)
          })
        }).catch((err) => {
        console.log('region1', err)
        reject(err)
      })
    });

  })
}

export function lookupVenue(lat, lng) {
  return new Promise((resolve, reject) => {
    let qs = {
      client_id: config.foursquare.clientID,
      client_secret: config.foursquare.clientSecret,
      ll: lat + ',' + lng,
      v: '20130815',
      limit: 1
    }

    let options = {
      uri: "https://api.foursquare.com/v2/venues/explore",
      method: "get",
      port: 443,
      qs: qs,
      headers: {
        'Accept': 'text/json',
        'Accept-Language': 'en',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': '0'
      },
      json: true
    }

    rp(options).then(body => {
      console.log('lookup')
      resolve(body)
    }).catch(err => reject(err))
  })
}
export function createRandomAddressForCity(randomCity) {
  return new Promise((resolve, reject) => {

    lookupVenue(randomCity.latitude, randomCity.longitude).then((venue) => {
      let vi = 0;
      let v = venue.response.groups[0].items[vi]
      let loc = {lid: v.venue.id}
      let locData;
      Location.findOne().then((d) => {
        if (d) return
        locData = d
      }).catch(err => err)
      if (locData) {
        console.log('loc exists');
        return
      }
      Location.create(loc)
      let newAddress = {address: v.venue.location.address}
      if (v.venue.location.lat && v.venue.location.lng) {
        newAddress.latitude = v.venue.location.lat
        newAddress.longitude = v.venue.location.lng
      }
      newAddress.city = randomCity._id
      newAddress.country = randomCity.country._id

      getOrCreateRegion(randomCity)
        .then(region => {
          if (region) newAddress.region = region
          Address.create(newAddress).then(a => resolve(a))
            .catch(err => console.log('err address create', err))
        }).catch(err => console.log('err getOrCreateRegion', err))
    }).catch(err => reject(err))

  })
}
