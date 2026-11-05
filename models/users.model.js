const mogoose = require('mongoose')
const Schema = mogoose.Schema

const userSchema = new Schema({
    Username: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true 
    },
    Role: {
        type: String,
        default: 'user'
    },
    Approved:{
        type: Boolean,
        default: false
    }

})

module.exports = mogoose.model('User', userSchema, 'User')