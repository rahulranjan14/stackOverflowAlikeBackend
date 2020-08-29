const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    name: {
        type: String,
        
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    profilepic: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png"
    },
    gender: {
        type: String,
        
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Person = mongoose.model("myPerson", PersonSchema)