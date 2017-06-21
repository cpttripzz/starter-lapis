var config = require('../config');
var mongoose = require('mongoose');
//['user','country','city','genre','instrument','association','band','musician']
module.exports = function() {
	var db = mongoose.connect(config.db.connectionString);
	var modelsPath = require('path').join(__dirname, '../models');

	require('fs').readdirSync(modelsPath).forEach(function (model) {
		require(__dirname, '../models/' +model);
	});
	return db;
};