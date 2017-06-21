var User = require('mongoose').model('User');
var acl = require('acl');
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var nodeAcl = new acl(new acl.mongodbBackend(mongoose.connection.db));
var config = require('../config');


export function allow(params) {
    let {roles, resources, permissions} = params;
    return nodeAcl.allow(roles,resources,permissions);
}