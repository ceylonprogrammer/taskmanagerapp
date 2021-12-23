const express = require('express')
require('./db/moongoose')


const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

// middleware function

// app.use((req,res,next)=>{
// if(req.method==='GET'){
// res.send('GET requests are disabled')
// }else{
//     next()
// }
// })

// app.use((req,res,next)=>{
// res.status(503).send('Site is currently down.Check back soon!')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// 
// without middleware: new request -> run route handler
// 
// with middleware : new request -> do something -> run route handler
// 
  


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task=require('./models/task')
const User=require('./models/user')

const main=async()=>{
    // const task=await Task.findById('61c1bf3a22e2d7055dc87f9e')
    // await task.populate('owner')
    // console.log(task.owner)
const user=await User.findById('61c1be7e172f37c2b7e0e172')
await user.populate('tasks')
console.log(user.tasks)

}

// main()