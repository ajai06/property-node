const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: String,
    email: String,
    password: String,
    active: { type: Boolean, required: true, default: false },
    temptoken: { type: String, required: true }
});

module.exports = mongoose.model('userList', userSchema);