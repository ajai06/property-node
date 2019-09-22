const mongoose = require('mongoose');
// const autoIncrement = require('mongoose-auto-increment');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

const mongoDB = 'mongodb://localhost:27017/realestate';

mongoose.connect(mongoDB, {useNewUrlParser: true});

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.once('open', function(){
    console.log('mongoDB connected');
})
.on('error', function(){
    console.log('mongoDB connection error')
})