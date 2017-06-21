var mongoose = require('mongoose'),
  URLSlugs = require('mongoose-url-slugs'),
  Schema = mongoose.Schema;

var GenreSchema = new Schema({
  name: {type: String, trim: true},
});

GenreSchema.plugin(URLSlugs('name'));
module.exports = mongoose.model('Genre', GenreSchema);