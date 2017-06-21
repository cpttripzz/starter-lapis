var mongoose = require('mongoose'),
  URLSlugs = require('mongoose-url-slugs'),
  Schema = mongoose.Schema;

var InstrumentSchema = new Schema({
  name: {type: String, trim: true},
});

InstrumentSchema.plugin(URLSlugs('name'));
module.exports = mongoose.model('Instrument', InstrumentSchema);