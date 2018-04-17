var mongoose = require('mongoose');

var Users = new mongoose.Schema({
    githubId: String
});

Users.plugin(require('mongoose-findorcreate'));

module.exports = mongoose.model('Users', Users);