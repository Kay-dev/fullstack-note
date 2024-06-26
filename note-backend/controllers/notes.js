const notesRouter = require('express').Router();
const Note = require('../models/note.js');
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');


const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}


notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
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
    const body = req.body
    if (!body || !body.content) {
        return res.status(400).json({ error: 'note.content is missing' })
    }
    // decode token
    const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
    if (!decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }
    // get user info
    const user = await User.findById(decodedToken.id)

    // save note info with userid
    const savedNote = await Note.create({
        content: body.content,
        important: body.important || false,
        user: user._id
    })

    // update notes of user
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
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