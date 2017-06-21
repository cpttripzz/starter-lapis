let config = require('../config')
let jwt = require('jsonwebtoken')

export function isJwtAuthenticated(req, res, next) {
  var token = req.body.token || req.params.token || req.headers['x-access-token'] || req.cookies.token
  console.log('isJwtAuthenticated',token)
  if (token) {
    jwt.verify(token, config.jwtSecret, (err, decoded)  => {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token.'})
      } else {
        req.user = decoded
        return next()
      }
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
  }
}