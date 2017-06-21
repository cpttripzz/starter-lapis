var acl = require('acl');
var config = require('../../config');

var mongodb = require('mongodb');
module.exports = function() {
    mongodb.connect(config.db.connectionString, function (error, db) {
        var mongoBackend = new acl.mongodbBackend(db, 'acl_');
        return mongoBackend;
    });
};
