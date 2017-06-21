const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Association = mongoose.model('Association')
import associationSchema from "./association.schema";
const MusicianSchema = new Schema(Object.assign(associationSchema, {
  bands : { type: Schema.Types.ObjectId, ref: 'Band' },
  instruments : { type: Schema.Types.ObjectId, ref: 'Instrument' }
}));
const Musician = Association.discriminator('Musician',MusicianSchema);

module.exports = mongoose.model('Musician', MusicianSchema);