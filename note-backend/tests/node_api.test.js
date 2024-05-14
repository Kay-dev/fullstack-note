const { test, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')

// wrap express app into superagent object.
const api = supertest(app)

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

    assert.strictEqual(response.body.length, 2)
})

test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'))
})

// close db after all tests
after(async () => {
    await mongoose.connection.close()
})