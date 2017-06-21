var passport = require('passport'),
  url = require('url'),
  googleStrategy = require('passport-google-oauth2').Strategy;
import config from '../../config';
import { saveOAuthUserProfile } from '../../services/user.service';

module.exports = function () {
  passport.use(new googleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      passReqToCallback: true,

      scope: config.google.scope,
    },
    function (req, token, tokenSecret, profile, done) {
      var providerData = profile._json;
      providerData.token = token;
      providerData.tokenSecret = tokenSecret;
      let photo =''
      if (Object.keys(profile.photos).length)  photo = profile.photos[ Object.keys(profile.photos)[0] ]['value']

      var providerUserProfile = {
        username: profile.displayName ? profile.displayName.replace(/\s+/g, '.').toLowerCase() : '',
        firstName: (profile.name || profile.name.givenName) ? profile.name.givenName : '',
        lastName: (profile.name || profile.name.familyName) ? profile.name.familyName : '',
        email: (profile.email) ? profile.email : '',
        provider: 'google',
        providerId: profile.id,
        photo: photo || false
      };
      saveOAuthUserProfile(req, providerUserProfile, done);
    }));
};