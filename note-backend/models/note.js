const mongoose = require('mongoose');


const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    important: Boolean,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

// optimize the data fields to be returned
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        // change _id to id
        returnedObject.id = returnedObject._id.toString()
        // remove _id and __v
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Note = mongoose.model('Note',noteSchema)

module.exports = Note