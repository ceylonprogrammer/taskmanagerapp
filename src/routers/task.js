const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// ADD NEW TASK
router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})

// GET ALL TASKS/ONLY FOR CURRENT LOGGED IN USER
// /tasks?completed=true
// limit skip
// GET /tasks?limit=10&skip=10
router.get('/tasks',auth, async (req, res) => {
    const match={}
if(req.query.completed){
match.completed=req.query.completed==='true'
}
    try {
        // const tasks = await Task.find({owner:req.user._id})
        // await req.user.populate('tasks')
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip)
            }
        })
        // res.send(tasks)
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }

})

// GET TASK BY ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
 
        const task=await Task.findOne({_id,owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }

})



// UPDATE EXISTING TASK

router.patch('/tasks/:id',auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdate = ['description', 'completed']
    const isValidOparation = updates.every((updates) => allowedUpdate.includes(updates))

    if (!isValidOparation) {
        return res.status(400).send({ error: 'Invalid update!' })
    }

    try {
        // use middleware to update task
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        

        // old method of update task
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        if (!task) {
            return res.status(400).send()
        }
        updates.forEach((update) => task[update] = req.body[update])

        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})



// DELETE TASK
router.delete('/tasks/:id',auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router