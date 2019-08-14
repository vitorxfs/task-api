const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')
const router = new express.Router()




//create
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        //sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }catch (e) {
        res.status(400).send(e)
    }

})

//login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }catch (e){
        res.status(400).send(error)

    } 
})

//logout
router.post('/users/logout', auth, async (req, res) => {
    
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch (e) {
        res.status(500).send()
    }
})




//read many
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//read one
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if(!user){
            return res.status(404).send()
        }
        res.send(user)

    } catch (e) {
        res.status(500).send()
    }

})




//update
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error:'Invalid updates!'})
    }

    try {
        
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete
router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        //sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//avatar upload
const upload = multer({
    limits: {
        filesize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Upload a picture (jpg or png)"))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()    
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

//avatar delete
router.delete('/users/me/avatar', auth, async (req, res) => {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
})

//avatar fetch
router.get('/users/:id/avatar', async (req,res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e) {
        res.status(404).send()
    }
})



module.exports = router