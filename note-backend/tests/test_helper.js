const Note = require("../models/note.js")

const initialNotes = [
    {
        content: 'HTML is easy',
        important: false,
    },
    {
        content: 'Browser can execute only JavaScript',
        important: true,
    },
]

const nonExistingId = async () => {
    const note = new Note({
        content: 'temp_test_content',
        important: true
    })

    await note.save()
    const id = note._id.toString()
    await note.deleteOne()
    return id
}

const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

module.exports = {
    initialNotes, nonExistingId, notesInDb
}