let Schema = require('mongoose').Schema;
export default {
  name: {type: String, trim: true},
  description: {type: String, trim: true},
  genres : [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
  addresses : [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  documents : [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  user : { type: Schema.Types.ObjectId, ref: 'User' }
};
