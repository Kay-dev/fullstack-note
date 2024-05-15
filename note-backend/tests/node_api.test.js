const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')
const bcrypt = require('bcrypt')
const Note = require('../models/note.js')
const User = require('../models/user.js')
const test_helper = require('./test_helper')

// wrap express app into superagent object.
const api = supertest(app)


describe('when there is initially some notes saved', () => {
    // init db before every test
    beforeEach(async () => {
        await Note.deleteMany({})
        await Note.insertMany(test_helper.initialNotes)
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

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')

        assert.strictEqual(response.body.length, test_helper.initialNotes.length)
    })

    test('the specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(e => e.content)
        assert(contents.includes('HTML is easy'))
    })

    describe('viewing a specific note', () => {

        test('a specific note can be viewed', async () => {
            const noteAtStart = await test_helper.notesInDb()
            const noteToView = noteAtStart[0]

            const resultNote = await api.get(`/api/notes/${noteToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            assert.deepStrictEqual(noteToView, resultNote.body)
        })

        test('fails with statuscode 404 if note does not exist', async () => {
            const validNonexistingId = await test_helper.nonExistingId()

            await api
                .get(`/api/notes/${validNonexistingId}`)
                .expect(404)
        })

        test('fails with statuscode 400 id is invalid', async () => {
            const invalidId = '5a3d5da59070081a82a3445'

            await api
                .get(`/api/notes/${invalidId}`)
                .expect(400)
        })
    })

    describe('addition of a new note', () => {
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
    })

    describe('update of a note', () => {
        test('a note can be updated', async () => {
            const noteAtStart = await test_helper.notesInDb()
            const noteBeforeUpdate = noteAtStart[0]

            const updatedNote = {
                ...noteBeforeUpdate,
                content: "async/await simplifies making async calls",
            }

            const noteAfterUpdate = await api.put(`/api/notes/${noteBeforeUpdate.id}`)
                .send(updatedNote)
                .expect(200)

            assert.strictEqual(noteAfterUpdate.body.content, updatedNote.content)

        })
    })


    describe('deletion of a note', () => {
        test('a note can be deleted', async () => {
            const noteAtStart = await test_helper.notesInDb()
            const noteToDelete = noteAtStart[0]

            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .expect(204)

            const notesEnd = await test_helper.notesInDb()
            const contents = notesEnd.map(e => e.content)

            assert.strictEqual(notesEnd.length, noteAtStart.length - 1)
            assert(!contents.includes(noteToDelete))
        })
    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        await User.create({ username: 'root', passwordHash })
    })

    test('creation succeeds with a fresh username', async () => {
        const userAtStart = await test_helper.usersInDb()
        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api.post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await test_helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, userAtStart.length + 1)
        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))

    })

    test('creation fail if username already taken', async () => {
        const userAtStart = await test_helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }
        const result = await api.post('/api/users')
            .send(newUser)
            .expect(409)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await test_helper.usersInDb()
        assert(result.body.error.includes('username must be unique'))
        assert.strictEqual(usersAtEnd.length, userAtStart.length)

    })
})

// close db after all tests
after(async () => {
    await mongoose.connection.close()
})

