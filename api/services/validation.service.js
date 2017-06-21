import validate from  '../../utils/validate'

export function validateEntityProps(type, entity) {
  const schemaPath = __dirname + '/../validators/' + type +'.schema.json'
  var readFile = require("bluebird").promisify(require("fs").readFile)
  return new Promise((resolve, reject) => {
    readFile(schemaPath)
      .then((schema) => JSON.parse(schema))
      .then((schema) => validate(entity, schema))
      .then((user) => resolve(user))
      .catch((err) =>  reject(err))
  });
}

export function getValidateEntityErrors(err) {
  let errors = {}
  err.map(err => {
    errors[err.path.replace(/\#\//i, '')] = err.message
  })
  return errors
}