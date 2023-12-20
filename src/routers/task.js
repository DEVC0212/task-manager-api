const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    // By Async And Await
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(404).send(e)
    }

    //By Chaining

    // const task = new Task(req.body)

    // task.save().then(()=>{
    //     res.status(201).send(task);
    // }).catch((e)=>{
    //     res.status(400).send(e);
    // })
})

router.get('/tasks', auth, async (req,res)=>{
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    // By Async Await
    try{
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            } 
        })
        const tasks = req.user.tasks;
        return res.send(tasks)
    } catch(e){
        console.log(e)
        res.status(500).send()
    }

    // By Chaining

    // Task.find({}).then((task)=>{
    //     res.send(task)
    // }).catch(()=>{
    //     res.status(500).send();
    // })
})

router.get('/tasks/:id', auth, async (req,res)=>{
    
    // By Async Await
    const _id = req.params.id;

    try{
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send();
    }

    // By Chaining

    // const _id = req.params.id;

    // Task.findById(_id).then((task)=>{
    //     if(!task){
    //         return res.status(404).send();
    //     }

    //     res.send(task);
    // }).catch((e)=>{
    //     res.status(500).send();
    // })
})

router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));
    if(!isValidOperation){
        return res.status(400).send({error: "Invalid Updates!"});
    }
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        // const task = await Task.findById(req.params.id);
        // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new: true , runValidators: true});
        if(!task){
            return res.status(404).send();
        }
        updates.forEach((update)=>{
            task[update] = req.body[update];
        })
        await task.save();
        res.send(task)
    }catch(e){
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth,  async (req,res)=>{
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e);
    }
})

module.exports = router;
