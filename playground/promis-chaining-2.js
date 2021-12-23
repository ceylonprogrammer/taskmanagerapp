require('../src/db/moongoose')
const Task=require('../src/models/task')

// Task.findByIdAndDelete('61be18f550d00bace42e7753').then((task)=>{
// console.log(task)
// return Task.countDocuments({completed:false})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })

const deleteAndCount=async (id)=>{
const task=await Task.findByIdAndDelete(id)
const count=await Task.countDocuments({completed:false})
return count
}

deleteAndCount('61be1aae294f60fb5a3d5cda').then((count)=>{
console.log(count)
}).catch((e)=>{
    console.log(e)
})