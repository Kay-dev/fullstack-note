const {expect, test} =  require('@jest/globals');
const assert = require('node:assert')

const average = require('../utils/for_testing').average

describe('average', () => {
    test('of one number is the number itself', () => {
        expect(average([3])).toBe(3)
    })

    test('of many is calculated right', () => {
        expect(average([1, 3, 5, 7, 8])).toBe(4.8)
    })

    test('of empty array is zero', () => {
        expect(average([])).toBe(0)
    })
})