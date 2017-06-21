require('babel-polyfill');
const domain='bandaid.com';
const apiPort = process.env.APIPORT || 3010;
const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  apiHost: process.env.APIHOST || '127.0.0.1',
  apiPort,
  domain,
  secret: 'fdfj*jdjThdk9wlshe53kd',
  projectDir: __dirname + '/../',
  app: {
      name: 'React Redux With Passport and Sequelize',
      profileImgPath: __dirname + '/../images'
    },
    jwtSecret : 'jfNIdd84jd9dsw637hej',
    db: {
      connectionString: 'mongodb://localhost/bandaid'
    },
    facebook: {
      clientID: '418259915025400',
      clientSecret: '4c9ef56592e122c0b9c95ed8a34a0a1e',
      callbackURL: 'http://' + domain + ':' + apiPort + '/oauthSuccess'
    },
    google: {
      clientID: '309796006487-b6ju56r441plsk1uf8l2vod0f6v0efe9.apps.googleusercontent.com',
      clientSecret: 'csgbFnLawbdWp4AQiNR4Y4A5',
      callbackURL: 'http://' + domain + ':' + apiPort + '/oauth/google/callback',
      scope: 'email'
    },
    foursquare: {
      clientID: 'CA5L5IPUIOFDTXIW5BU1X01OJYDCMUAANU2AH1DWEE4G5MOE',
      clientSecret: '43WA0G1TX5KKMEN5VSRRX5A1XH5RDU4KESBU0BGEBOYIZN1P'
    }

}, environment);
