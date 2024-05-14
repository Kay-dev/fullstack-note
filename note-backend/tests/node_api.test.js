const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const Note = require('../models/note.js')
const test_helper = require('./test_helper')

// wrap express app into superagent object.
const api = supertest(app)

// init db before every test
beforeEach(async () => {
    await Note.deleteMany({})
    let noteObject = new Note(test_helper.initialNotes[0])
    await noteObject.save()
    noteObject = new Note(test_helper.initialNotes[1])
    await noteObject.save()
})

// close db after all tests
after(async () => {
    await mongoose.connection.close()
})

// test api
// It is better to define the test as a regex instead of an exact string.
// If using a string, the value of the header must be exactly the same.
// for a header "application/json; charset=utf-8", we only care about if it exists with "application/json"
test('notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, test_helper.initialNotes.length)
})

test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'))
})

test('a valid note can be added', async () => {
    const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
    }

    await api.post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const notes = await test_helper.notesInDb()
    assert.strictEqual(notes.length, test_helper.initialNotes.length + 1)
    const contents = notes.map(e => e.content)
    assert(contents.includes("async/await simplifies making async calls"))
})

test('note without content is not added', async () => {
    const newNote = {
        important: true
    }

    await api.post("/api/notes")
    .send(newNote)
    .expect(400)

    const notes = await test_helper.notesInDb()
    assert.strictEqual(notes.length, test_helper.initialNotes.length)
})