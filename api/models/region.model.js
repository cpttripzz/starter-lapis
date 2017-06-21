var mongoose = require('mongoose'),
  URLSlugs = require('mongoose-url-slugs'),
  Schema = mongoose.Schema

var RegionSchema = new Schema({
  shortName: {type: String, trim: true},
  longName: {type: String, trim: true},
  country : { type: Schema.Types.ObjectId, ref: 'Country' }
});

RegionSchema.plugin(URLSlugs('longName'));
module.exports = mongoose.model('Region', RegionSchema);