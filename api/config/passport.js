var passport = require('passport'),
		mongoose = require('mongoose');
import { getProfile } from '../services/user.service';

module.exports = function() {
	var User = mongoose.model('User');

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser( (id, done) => done(false,getProfile(id)))

	//require('./strategies/local.js')();
	require('./strategies/facebook.js')();
	require('./strategies/google.js')();
};