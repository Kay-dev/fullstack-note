const notesRouter = require('express').Router();
const Note = require('../models/note.js');


notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
    res.json(notes)
})

notesRouter.get('/:id', async (req, res, next) => {
    const note = await Note.findById(req.params.id)
    if (note) {
        res.json(note)
    } else {
        res.status(404).end()
    }

})

notesRouter.post('/', async (req, res, next) => {
    const note = req.body
    if (!note || !note.content) {
        return res.status(400).json({ error: 'note.content is missing' })
    }

    const savedNote = await Note.create({
        content: note.content,
        important: note.important || false
    })
    res.status(201).json(savedNote)

})

notesRouter.put('/:id', async (req, res, next) => {
    const note = await Note.findById(req.params.id)
    if (note) {
        note.content = req.body.content
        note.important = req.body.important
        await note.save()
        res.json(note)
    } else {
        res.status(404).end()
    }

})

notesRouter.delete('/:id', async (req, res, next) => {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()

})

module.exports = notesRouter