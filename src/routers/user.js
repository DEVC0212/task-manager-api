const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const Task = require('../models/tasks');
const multer = require('multer');
const sharp = require('sharp');
const {welcomeEmail,cancelEmail} = require('../emails/account');
const auth = require('../middleware/auth');

router.post('/users', async (req,res)=>{
    const user = new User(req.body)

    // By Async And Await
    try{
        await user.save()
        welcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(404).send(e)
    }
    //By Chaining

    // user.save().then(()=>{
    //     res.status(201).send(user);
    // }).catch((e)=>{
    //     res.status(400).send(e);
    // })
})

router.post('/users/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken()
        res.send({user,token});
    }catch(e){
        res.status(400).send();
    }
})

router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save();
        res.send()
    }catch(e){
        res.status(500).send(); 
    }
})

router.post('/users/logoutAll',auth, async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send();
    }
})

router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user);
    //By Async Await
    // try{
    //     const users = await User.find({})
    //     return res.send(users)
    // } catch(e){
    //     res.status(500).send()
    // }

    // By Chaining

    // User.find({}).then((users)=>{
    //     res.send(users);
    // }).catch((e)=>{
    //     res.status(500).send();
    // })
})

router.patch('/users/me',auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));

    if(!isValidOperation){
        res.status(400).send({error: 'Invalid Updates!'})
    }

    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update];
        })
        await req.user.save();
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth, async (req,res)=>{
    try{
        await req.user.deleteOne()
        await Task.deleteMany({owner: req.user._id})
        cancelEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e);
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,callback) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('Please upload an image'))
        }
        callback(undefined,true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({
        error: error.message
    })
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router;