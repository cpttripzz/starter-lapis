let mongoose = require('mongoose')
mongoose.Promise = Promise

let Musician = mongoose.model('Musician')
let Address = mongoose.model('Address')
let Country = mongoose.model('Country')
let Band = mongoose.model('Band')
let Region = mongoose.model('Region')
export function getMusicians(params={}){
  return Musician.find(params)
    .populate('user', 'firstName, lastName, email, username')
    .populate('genres', 'name slug')
    .populate('documents')
    .populate('addresses')
    .populate('bands')
    .populate('instruments', 'name slug')
    .then(musicians => Band.populate(musicians, {path:'bands',model:'Band'}))
}