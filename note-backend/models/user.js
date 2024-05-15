const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    passwordHash: String,
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note' // used to refer to Note model when populate
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        // change _id to id
        returnedObject.id = returnedObject._id.toString()
        // remove _id and __v
        delete returnedObject._id
        delete returnedObject.__v
        // remove passwordHash
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User