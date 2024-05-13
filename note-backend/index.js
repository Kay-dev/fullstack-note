const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const Note = require('./models/note');

app.use(cors());
app.use(express.static("dist"))
app.use(bodyParser.json());
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)


app.get('/api/notes', (req, res) => {
    Note.find({}).then(result => {
        res.json(result)
    })
})

app.get('/api/notes/:id', (req, res, next) => {
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

app.post('/api/notes', (req, res, next) => {
    const note = req.body
    if (!note || !note.content) {
        return res.status(400).json({ error: 'note.content is missing' })
    }
    const newNote = Note.create({
        content: note.content,
        important: note.important || false
    })
    newNote.save()
    .then(savedNote => {
        res.json(savedNote)
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (req, res, next) => {
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

app.delete('/api/notes/:id', (req, res, next) => {
    const id = req.params.id
    Note.findByIdAndDelete(id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})