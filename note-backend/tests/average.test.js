const {test, describe} = require('node:test')
const assert = require('node:assert')

const average = require('../utils/for_testing').average

describe('average', () => {
    test('of one number is the number itself', () => {
        assert.strictEqual(average([3]), 3)
    })

    test('of many is calculated right', () => {
        assert.strictEqual(average([1, 3, 5, 7, 8]), 4.8)
    })

    test('of empty array is zero', () => {
        assert.strictEqual(average([]), 0)
    })
})