const User = require('mongoose').model('User');
const passport = require('passport');
const acl = require('acl');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const nodeAcl = new acl(new acl.mongodbBackend(mongoose.connection.db));
const config = require('../config');
const jwt = require('jsonwebtoken');
import { removeStringBeforeLastInstance } from '../../utils/stringUtils';
import { pick } from '../../utils/objUtils';
import {
  validateEntityProps,
  getValidateEntityErrors,
} from './validation.service';
import { download, existsSync } from '../../utils/fileUtils';
const del = require('del');
const mkdirp = require('mkdirp');

export function login(req) {
  const { username, password } = req.body;

  const User = require('mongoose').model('User');
  return new Promise((resolve, reject) => {
    User.findOne({ username }).then(user => {
      const errMsg = { message: 'Invalid username or password' };
      if (!user || !user.authenticate(password)) {
        return reject(errMsg);
      }

      req.login(user, err => {
        if (err) {
          return reject({ loginError: err });
        }
        return resolve(getUserDetails(user));
      });
    }, err => {
      reject(err);
    });
  });
}

export function handleProfileImageSave(fileOriginalName, userId) {
  const ext = removeStringBeforeLastInstance(fileOriginalName, '.');
  const fileName = userId + '.' + ext;
  const thumbPath = config.app.profileImgPath + '/thumbs/' + userId + '.png';
  if (!existsSync(config.app.profileImgPath + '/thumbs/')) {
    mkdirp(config.app.profileImgPath + '/thumbs/');
  }

  let fs = require('fs'), gm = require('gm').subClass({ imageMagick: true });
  gm(config.app.profileImgPath + '/' + fileName)
    .resize(40, 40, '!')
    .noProfile()
    .write(thumbPath, err => {
      if (err) console.log(err);
    });
  return fileName;
}
export function getUserDetails(user) {
  return new Promise((resolve, reject) => {
    const authUser = {
      _id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
    };
    // function (users) { return users[0]; }
    // users => users[0]
    nodeAcl
      .userRoles(user.id)
      .then(roles => {
        authUser.roles = roles;
        return nodeAcl.whatResources(roles);
      })
      .then(resources => {
        authUser.resources = resources;
        authUser.token = jwt.sign(authUser, config.jwtSecret, {
          expiresIn: 1440 * 60 * 7, // expires in 24 hours * 7
        });
        resolve(authUser);
      })
      .catch(err => reject(getErrorMessage(err)));
  });
}
export function getUsers(req, res) {
  const userMap = [];
  return new Promise((resolve, reject) => {
    const User = require('mongoose').model('User');
    User.find({}).then(users => {
      users.forEach(user => {
        // console.log({name: user.name,email: user.email});
        const u = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };

        nodeAcl.userRoles(user.id).then(roles => {
          u.roles = roles;
        });
        userMap.push(u);
      });
      resolve(userMap);
    }, err => {
      reject(err);
    });
  });
}

export function getProfile(id) {
  return new Promise((resolve, reject) => {
    const User = require('mongoose').model('User');
    User.findById(id)
      .select('id firstName lastName email photo')
      .lean()
      .then(
        user => {
          console.log('ffukk', user);
          resolve(user);
        },
        err => reject(err),
      );
  });
}

export function postProfile(req) {
  // const profile = pick(req.body, 'email', 'firstName', 'lastName')
  console.log('postProfile', req.body, req.user);
  return new Promise((resolve, reject) => {
    const profile = pick(req.body, 'email', 'firstName', 'lastName', 'photo');
    User.findOneAndUpdate({ _id: req.user._id }, profile)
      .then(user => resolve(getProfile(user.id)), err => reject(err));
  });
}

export function exists(req) {
  return new Promise((resolve, reject) => {
    const User = require('mongoose').model('User');
    User.findOne(req).then(result => resolve(
      result !== null
        ? {
            [Object.keys(req)[0]]: Object.keys(req)[0] + ' already exists',
          }
        : false,
    ), err => reject(err));
  });
}
export function checkProps(props) {
  return new Promise((resolve, reject) => {
    propsUnique(props)
      .then(userProps => userProps.filter(prop => prop !== false))
      .then(userPropsNonUnique => {
        const objProps = {};
        if (!userPropsNonUnique.length) return resolve();
        userPropsNonUnique.forEach(prop => {
          for (const propName in prop) {
            objProps[propName] = prop[propName];
          }
        });
        return reject(objProps);
      })
      .catch(err => reject(getErrorMessage(err)));
  });
}
var getErrorMessage = function(err) {
  console.log('getErrorMessage', err);
  let message = 'nope';
  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'Username already exists';
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    return getValidateEntityErrors(err);
  }
  return message;
};

export function register(req, res, next) {
  return new Promise((resolve, reject) => {
    newUser(req.body)
      .then(user => {
        req.login(user, err => {
          if (err) {
            reject(err);
          }
          resolve(user);
        });
      })
      .catch(err => reject(err));
  });
}
export function propsUnique(objUser) {
  return Promise.all(
    Object.keys(objUser)
      .filter(prop => ['email', 'username'].indexOf(prop) >= 0)
      .map(prop => exists({ [prop]: objUser[prop] })),
  );
}
export function newUser(user) {
  return new Promise((resolve, reject) => {
    if (!user.provider) user.provider = 'local';

    validateEntityProps('user', user)
      .then(user => {
        propsUnique(user)
          .then(userProps => userProps.filter(prop => prop !== false))
          .then(userPropsNonUnique => {
            if (userPropsNonUnique.length) return reject(userPropsNonUnique);
            const objUser = new User(user);
            objUser
              .save(user)
              .then(user => resolve(getUserDetails(user)), err =>
                reject(getErrorMessage(err)));
          });
      })
      .catch(err => reject(getErrorMessage(err)));
  });
}

export function saveOAuthUserProfile(req, profile, done) {
  User
    .findOne({
      provider: profile.provider,
      providerId: profile.providerId,
    })
    .lean()
    .exec()
    .then(user => {
      if (!user) {
        let photo = false;
        if (profile.photo) {
          photo = profile.photo.split('?')[0];
          profile.photo = true;
        }
        user = new User(profile);

        user.save(err => {
          if (err) {
            const message = _this.getErrorMessage(err);
            console.log(message);
          }
          req.user = {
            id: user.id,
            email: user.email || null,
            username: user.username,
          };
          console.log('req.user 1', req.user);
          if (photo) {
            const ext = removeStringBeforeLastInstance(photo, '.');
            download(
              photo,
              __dirname + '/../../images',
              user.id + '.' + ext,
              () => {
                console.log(
                  'downloaded',
                  photo,
                  __dirname + '/../../images',
                  user.id + '.' + ext,
                );
              },
            );
          }
          return done(err, req.user);
        });
      } else {
        console.log('usessssr', user);
        return done(null, user);
      }
    })
    .catch(err => done(err));
}
