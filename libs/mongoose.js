var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true); //убирает сообщение о депрекейте
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost:27017/ENRUusers", { useNewUrlParser: true });

module.exports = mongoose;