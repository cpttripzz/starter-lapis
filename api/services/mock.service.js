import { newUser } from './user.service'
import { getRandomArrayElement, randomIntFromInterval } from '../../utils/mathUtils'
import { createRandomAddressForCity } from './location.service'
import { promiseWhile } from './promise.service'
import { download,existsSync } from '../../utils/fileUtils'
import { handleProfileImageSave } from '../services/user.service';


let mongoose = require('mongoose')
let _ = require('lodash')
let async = require('async')
let faker = require('faker')

export function loadMocks() {

  let genres, instruments, cities, countries;
  let assert = require('assert')
  let config = require('../config')
  let readFile = require("bluebird").promisify(require("fs").readFile)


  let Genre = mongoose.model('Genre');
  let Instrument = mongoose.model('Instrument');
  let Country = mongoose.model('Country');
  let City = mongoose.model('City');
  let Address = mongoose.model('Address');
  async.waterfall([

      (callback) => {
        Genre.find({}).then((genres) => {
          if (!genres.length) {
            readFile(__dirname + '/../json/genres.json')
              .then((json) =>  JSON.parse(json))
              .then((json) => Genre.create(json).then(genres => callback(null, genres)))
          } else {
            callback(null, genres)
          }
        })
      },
      (genres, callback) => {
        Instrument.find({}).then((instruments) => {
          if (!instruments.length) {
            readFile(__dirname + '/../json/instruments.json')
              .then((json) =>  JSON.parse(json))
              .then((json) => Instrument.create(json).then(instruments => callback(null, genres, instruments)))
          } else {
            callback(null, genres, instruments);
          }

        })
      },
      (genres, instruments, callback) => {
        Country.find({}).then((countries) => {
          if (!countries.length) {
            readFile(__dirname + '/../json/countries.json')
              .then((json) =>  JSON.parse(json))
              .then((json) => Country.create(json).then((countries)  => callback(null, genres, instruments, countries)))
          } else {
            callback(null, genres, instruments, countries);
          }

        })
      },
      (genres, instruments, countries, callback) => {

        City.find({}).populate('country', 'name').then((cities) => {
          if (!cities.length) {
            readFile(__dirname + '/../json/cities.json')
              .then((json) =>  JSON.parse(json))
              .then((json) => {
                let cities = _.uniq(json, (item, key, a) => item.name)
                cities.forEach((city) => {
                  let countryCode = city.country_code
                  let country = countries.find(c => c.code == countryCode)
                  city.country = country._id
                  delete city.country_code
                  City.create(city).then(data => data).catch((e) => console.log(e))
                })
                setTimeout(() => {
                  City.find({}).populate('country', 'name').then((cities) => {
                    callback(null, genres, instruments, countries, cities)
                  })
                }, 500)

              })

          } else {
            callback(null, genres, instruments, countries, cities);
          }
        })
      },

      (genres, instruments, countries, cities, callback) => {
        for (let x = 0; x < 20; x++) {
          newUser({
            name: faker.name.findName(),
            email: faker.internet.email(),
            username: faker.internet.userName(),
            password: '11111111'
          }).then((user) => {
            let assocNumber = randomIntFromInterval(1, 4)

            let assocIndex = 0
            promiseWhile(()=>assocIndex < assocNumber, () => {
              // The function to run, should return a promise
              return new Promise((resolve, reject) => {
                let assoc;
                if (randomIntFromInterval(1, 5) >= 4) {
                  assoc = mongoose.model('Musician')
                } else {
                  assoc = mongoose.model('Band')
                }
                let newAssocGenres = []
                for (let gi = 0; gi < randomIntFromInterval(1, 4); gi++) {
                  newAssocGenres.push(getRandomArrayElement(genres)['_id'])
                }
                let randomCity = getRandomArrayElement(cities)
                setTimeout(() => {
                  createRandomAddressForCity(randomCity).then(address => {
                    assoc.create({
                      name: faker.lorem.words(randomIntFromInterval(1, 3)),
                      description: faker.company.bs(),
                      genres: newAssocGenres,
                      addresses: address._id,
                      user: user._id

                    }).then(newAssoc => {
                      assocIndex++;
                      return resolve(newAssoc)
                    }).catch(e => e)
                  }).catch(e => console.log('createRandomAddressForCity failed', e))
                }, 250)
              })

            }).then((assoc) => assoc).catch((e) => {
              console.log('a', e);
              return e
            })
          }).catch((e) => console.log('new user err', e))
        }
        callback(null, 'next');
      },

      //(callback) => {
      //  callback(null, 'next');
      //},


    ],
// optional callback
    function (e, results) {
      if (e) console.log(e);
    });

}

export function createMockRelationships() {
  var RateLimiter = require('limiter').RateLimiter;
  var limiter = new RateLimiter(1, 250);

  let Musician = mongoose.model('Musician')
  let Band = mongoose.model('Band')
  let User = mongoose.model('User')
  let Document = mongoose.model('Document')
  async.waterfall([
    (callback) => Musician.find({}).then((musicians) => callback(null, musicians)),
    (musicians, callback) => Band.find({}).then((bands) => callback(null, musicians, bands)),
    (musicians, bands, callback) => User.find({}).then((users) => callback(null, musicians, bands, users)),
    (musicians, bands, users, callback) => {

      users.forEach(user => {

        let photo = faker.image.image()
        let ext = 'jpg'
        download(photo, __dirname + '/../../images', user._id + '.' + ext)
          .then(p => handleProfileImageSave('download.jpg', user._id))

      })
      bands.forEach(band => {
        let musArr = []
        let path = __dirname + '/../../images/bands/'
        let photo = faker.image.image()
        let doc = {name: band.slug, type: 'image', extension: 'jpg', path: '/bands'}

        for (let x = 0; x < randomIntFromInterval(1, 5); x++) {
          let randomMusician = getRandomArrayElement(musicians)
          if (musArr.indexOf(randomMusician._id) < 0) {

            musArr.push(randomMusician._id)

            Musician.findById(randomMusician._id).then(musician => {
              if(!musician) return
              if (musician.bands && musician.bands.length) {
                musician.bands.addToSet(band)
              } else {
                musician.bands = band;
              }
              musician.save()
            })
          }
        }

        Document.create(doc).then(doc => {
          Band.findOneAndUpdate({_id: band._id}, {musicians: musArr, documents: doc._id}).then( band => {
            download(photo, path, doc._id + '.jpg').then( p => {
              console.log('downloaded', photo, path + doc._id + '.jpg')
            })
          })
        })
      })
      musicians.forEach(musician => {
        let path = __dirname + '/../../images/musicians/'
        let photo = faker.image.image()
        let doc = {name: musician.slug, type: 'image', extension: 'jpg', path: '/musicians'}

        Document.create(doc).then(doc => {
          Musician.findOneAndUpdate({_id: musician._id}, {documents: doc._id}).then( mus => {
            download(photo, path, doc._id + '.jpg').then( p => {
              console.log('downloaded', photo, path + doc._id + '.jpg')
            })
          })
        })
      })
    }
  ])
}




