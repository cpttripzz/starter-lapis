var mongoose = require('mongoose'),
  URLSlugs = require('mongoose-url-slugs'),
  Schema = mongoose.Schema

var CitySchema = new Schema({
  name: {type: String, trim: true},
  country : { type: Schema.Types.ObjectId, ref: 'Country' },
  latitude: {type: String, trim: true},
  longitude: {type: String, trim: true}
});


CitySchema.plugin(URLSlugs('name'));
module.exports = mongoose.model('City', CitySchema);