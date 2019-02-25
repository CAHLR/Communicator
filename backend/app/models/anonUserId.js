var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AnonUserIdSchema   = new Schema({
    anonUserId: String,
    timestamp: Date,
});

module.exports = mongoose.model('AnonUserId', AnonUserIdSchema);
