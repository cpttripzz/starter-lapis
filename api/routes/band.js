import { getBands } from '../services/band.service'
module.exports = function (app) {
  app.get('/bands/', (req, res) => getBands(req.query).then(bands => res.json(bands)) )
}