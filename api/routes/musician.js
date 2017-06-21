import { getMusicians } from '../services/musician.service'
module.exports = function (app) {

  process.on("unhandledRejection", function (reason, p) {
    console.log("Unhandled", reason, p) // log all your errors, "unsuppressing" them.
    throw reason // optional, in case you want to treat these as errors
  })

  app.get('/musicians', (req, res) => getMusicians().then(musicians => res.json(musicians)) )

}