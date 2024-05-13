const mongoose = require('mongoose');
// const url = `mongodb+srv://elan:dpNCAq7JjzMv3DCl@cluster0.rfretc1.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`
const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false);

console.log("connecting to", url);

mongoose.connect(url)
    .then(result => {
        console.log("connected to MongoDB");
    }).catch(error => {
        console.log("error connecting to MongoDB:", error.message);
    })

const noteSechema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    important: Boolean,
})

// optimize the data fields to be returned
noteSechema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Note = mongoose.model('Note',noteSechema)

module.exports = Note