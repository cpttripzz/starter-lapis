var passport = require('passport'),
	url = require('url'),
	FacebookStrategy = require('passport-facebook').Strategy,
	userService = require('../../services/user.service');

import config from '../../config';

module.exports = function() {
	passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL,
		passReqToCallback: true
	},
	function(req, accessToken, refreshToken, profile, done) {
		var providerData = profile._json;
		providerData.accessToken = accessToken;
		providerData.refreshToken = refreshToken;

		var providerUserProfile = {
			name: profile.name.givenName,
			email: profile.emails[0].value,
			username: profile.username,
			provider: 'facebook',
			providerId: profile.id,
			providerData: providerData
		};
		//return done(null, profile.username);
		//userService.saveOAuthUserProfile(req, providerUserProfile, done);
	}));
};