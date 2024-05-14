const notesRouter = require('express').Router();
const Note = require('../models/note.js');


notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
    res.json(notes)
})

notesRouter.get('/:id',  (req, res, next) => {
    const id = req.params.id
    Note.findById(id)
        .then(result => {
            if (result) {
                res.json(result)
            } else {
                res.status(404).end()
            }
        }).catch(error => next(error))
})

notesRouter.post('/', (req, res, next) => {
    const note = req.body
    if (!note || !note.content) {
        return res.status(400).json({ error: 'note.content is missing' })
    }
    Note.create({
        content: note.content,
        important: note.important || false
    })
        .then(savedNote => {
            res.status(201).json(savedNote)
        })
        .catch(error => next(error))
})

notesRouter.put('/:id', (req, res, next) => {
    const id = req.params.id

    Note.findById(id)
        .then(note => {
            if (note) {
                note.content = req.body.content
                note.important = req.body.important
                note.save()
                    .then(updatedNote => {
                        res.json(updatedNote)
                    }).catch(error => next(error))
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

notesRouter.delete('/:id', (req, res, next) => {
    const id = req.params.id
    Note.findByIdAndDelete(id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

module.exports = notesRouter