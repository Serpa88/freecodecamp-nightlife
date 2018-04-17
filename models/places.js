var mongoose = require('mongoose');

var Places = new mongoose.Schema({
    placeId: String,
    people: [String]
});

Places.plugin(require('mongoose-findorcreate'));

module.exports = mongoose.model('Places', Places);