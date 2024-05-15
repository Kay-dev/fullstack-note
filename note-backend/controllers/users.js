const usersRouter = require('express').Router();
const User = require('../models/user.js');
const bcrypt = require('bcrypt')


usersRouter.post("/", async (req, res, next) => {
    const {username, name, password} = req.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const savedUser = await User.create({username, name, passwordHash})
    res.status(201).json(savedUser)
})

module.exports = usersRouter