const {expect, test, beforeEach, beforeAll, afterAll, describe} =  require('@jest/globals');

const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const app = require('../app')
const Note = require('../models/note.js')
const User = require('../models/user.js')
const test_helper = require('./test_helper')

// wrap express app into superagent object. we doesn't need listen to any ports
const api = supertest(app)


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
        expect(usersAtEnd).toHaveLength(userAtStart.length + 1)
        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)

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
        expect(usersAtEnd).toHaveLength(userAtStart.length)
        expect(result.body.error).toContain('username must be unique')
    })
})


describe('when there is initially some notes saved', () => {

    let token;
    beforeAll(async ()=>{
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = await User.create({ username: 'root', passwordHash })
        token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET, {expiresIn: '1h'})
    })

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
        expect(response.body).toHaveLength(test_helper.initialNotes.length)
    })

    test('the specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')

        const contents = response.body.map(e => e.content)
        expect(contents).toContain('HTML is easy')
    })

    describe('viewing a specific note', () => {

        test('a specific note can be viewed', async () => {
            const noteAtStart = await test_helper.notesInDb()
            const noteToView = noteAtStart[0]

            const resultNote = await api.get(`/api/notes/${noteToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            expect(resultNote.body).toEqual(noteToView)
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
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const notes = await test_helper.notesInDb()
            expect(notes).toHaveLength(test_helper.initialNotes.length + 1)
            const contents = notes.map(e => e.content)
            expect(contents).toContain("async/await simplifies making async calls")
        })

        test('note without content is not added', async () => {
            const newNote = {
                important: true
            }

            await api.post("/api/notes")
                .send(newNote)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            const notes = await test_helper.notesInDb()
            expect(notes).toHaveLength(test_helper.initialNotes.length)
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
            
            expect(noteAfterUpdate.body.content).toBe(updatedNote.content)

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

            expect(notesEnd.length).toBe(noteAtStart.length - 1)
            expect(contents).not.toContain(noteToDelete.content)            
        })
    })
})

// close db after all tests
afterAll(async () => {
    await mongoose.connection.close()
})

