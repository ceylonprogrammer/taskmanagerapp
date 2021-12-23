const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')

// ADD NEW USER
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        
        await user.save()
        const token=await user.genarateAuthToken()

        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }

})


// LOGIN USER
router.post('/users/login',async(req,res)=>{
try {
    const user=await User.findByCredentials(req.body.email,req.body.password)

    const token=await user.genarateAuthToken()
    res.send({user,token})
} catch (e) {
    res.status(400).send()
}
})

// LOGOUT FROM CURRENT SESSION ONLY
router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// LOGOUT FROM ALL SESSIONS

router.post('/users/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// GET CURRENT LOGGED USER PROFILE
router.get('/users/me',auth, async (req, res) => {
res.send(req.user)
  
})
// GET USER BY ID
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }

// })


// UPDATE EXSITING USER
// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdate = ['name', 'email', 'password', 'age']
//     const isValidOparation = updates.every((updates) => allowedUpdate.includes(updates))
//     if (!isValidOparation) {
//         return res.status(400).send({ error: 'Invalid update!' })
//     }

//     try {
//         const user=await User.findById(req.params.id)
// // middlware run for update for each keys in object
//         updates.forEach((update)=>user[update]=req.body[update])

//         await user.save()

//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)

//     } catch (e) {
//         res.status(400).send(e)
//     }
// })
// UPDATE USER PROFILE
router.patch('/users/me',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'age']
    const isValidOparation = updates.every((updates) => allowedUpdate.includes(updates))
    if (!isValidOparation) {
        return res.status(400).send({ error: 'Invalid update!' })
    }

    try {
      
// middlware run for update for each keys in object
        updates.forEach((update)=>req.user[update]=req.body[update])

        await req.user.save()
        res.send(req.user)

    } catch (e) {
        res.status(400).send(e)
    }
})

// DELETE USER
// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

router.delete('/users/me',auth, async (req, res) => {
    try {
        await req.user.remove()
        
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload=multer({

    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
return cb(new Error('Please upload an image'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{

    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
try {
    const user=await User.findById(req.params.id)
    if(!user||!user.avatar){
        throw new Error()

    }
    res.set('Content-Type','image/png')
    res.send(user.avatar)
} catch (e) {
    res.status(404).send()
}
})

module.exports = router