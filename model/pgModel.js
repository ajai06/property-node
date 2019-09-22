const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const pgSchema = new Schema({
    name: String,
    email: String,
    userId: String,
    mobile: Number,
    city:  String,
    location: String,
    availableFor: String,
    occupancy: String,
    bathroom: String,
    balcony: String,
    parking: String,
    furnishDetails: {
        ac: String,
        wifi: String,
        tv: String,
        fridge: String,
        washingMachine:  String
    },
    rent: Number
});

module.exports = mongoose.model('pgList', pgSchema);