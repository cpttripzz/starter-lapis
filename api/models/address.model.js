var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressSchema = new Schema({
  address: {type: String, trim: true},
  latitude: {type: String, trim: true},
  longitude: {type: String, trim: true},
  country : { type: Schema.Types.ObjectId, ref: 'Country' },
  city : { type: Schema.Types.ObjectId, ref: 'City' },
  region : { type: Schema.Types.ObjectId, ref: 'Region' }
});


module.exports = mongoose.model('Address', AddressSchema);