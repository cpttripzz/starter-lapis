var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var LocationSchema = new Schema({
  lid: {type: String, trim: true},
});

module.exports = mongoose.model('Location', LocationSchema);