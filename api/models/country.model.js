var mongoose = require('mongoose'),
  URLSlugs = require('mongoose-url-slugs'),
  Schema = mongoose.Schema;

var CountrySchema = new Schema({
  name: {type: String, trim: true},
  code: {type: String, trim: true}
});


CountrySchema.plugin(URLSlugs('name'));
module.exports = mongoose.model('Country', CountrySchema);