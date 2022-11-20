const express = require('express');
const Auth = require('../middleware/auth');
const User = require('../models/user');

const router = new express.Router();

// signup
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (error) {
        res.status(400).send(error);
    }
});

// login
router.post('/user/login', async (req, res) => {
    debugger
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        return res.status(200).send({ user, token });
    }
    catch (error) {
        res.status(400).send(error);
    }
});

// logout
router.post('/user/logout', Auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
});

// logout all
router.post('/users/logoutAll', Auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
});

module.exports = router;