import schemaValidator from 'z-schema';
export default function validate(objToValidate, schema) {
  var validator = new schemaValidator({
    breakOnFirstError: false,

  });
  return new Promise((resolve, reject) => {
    validator.validate(objToValidate, schema, (err, valid)  => {
      if (err) { console.log('err',err); return reject(err) }
      resolve(objToValidate);
    });
  })
}