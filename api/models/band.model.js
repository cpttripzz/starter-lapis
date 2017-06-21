let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Association = mongoose.model('Association')
import associationSchema from "./association.schema";

let BandSchema = new Schema(Object.assign(associationSchema,{
  musicians : [{ type: Schema.Types.ObjectId, ref: 'Musician' }],
  bandVacancy : [{ type: Schema.Types.ObjectId, ref: 'BandVacancy' },

]}))

var Band = Association.discriminator('Band',BandSchema)
module.exports = mongoose.model('Band', BandSchema)