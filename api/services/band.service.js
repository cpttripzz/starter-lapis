//import { pageable } from '../decorators/pageable.decorator'
let mongoose = require('mongoose')
mongoose.Promise = Promise

let Musician = mongoose.model('Musician')
let Address = mongoose.model('Address')
let Country = mongoose.model('Country')
let City = mongoose.model('City')
let Band = mongoose.model('Band')
let Region = mongoose.model('Region')

export function getBands(params = {}) {
  return new Promise((resolve, reject) => {
    let limit = (params.limit) ?  params.limit : 10
    let page = (params.page) ? params.page : 1
    let skip = (page - 1) * limit

    delete params.limit
    delete params.page

    Promise.all([
      Band.find(params)
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName, lastName, email, username')
        .populate('genres', 'name slug')
        .populate('documents')
        .populate('addresses')
        .populate('musicians')
        .populate('instruments', 'name slug')
        .then(bands => Musician.populate(bands, {path: 'musicians', model: 'Musician'}))
        .then(bands => Country.populate(bands, {path: 'addresses.country', model: 'Country'}))
        .then(bands => Region.populate(bands, {path: 'addresses.region', model: 'Region'}))
        .then(bands => City.populate(bands, {path: 'addresses.city', model: 'City'})),
      Band.find(params).count()]
    ).then(data => resolve({data:data[0],meta:{page:page,limit:limit,total: data[1]}}))
  })
}