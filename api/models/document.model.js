var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var DocumentSchema = new Schema({
  name: {type: String, trim: true},
  type: {type: String, trim: true},
  extension: {type: String, trim: true},
  path: {type: String, trim: true}
});

module.exports = mongoose.model('Document', DocumentSchema);