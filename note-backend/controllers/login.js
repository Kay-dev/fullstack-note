const loginRouter = require('express').Router();
const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

loginRouter.post("/", async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }
    const data = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(data, process.env.SECRET, {expiresIn: '1h'})
    return res.status(200).send({ token, username: user.username, name: user.name })

})

module.exports = loginRouter
