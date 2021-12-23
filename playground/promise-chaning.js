require('../src/db/moongoose')
const User=require('../src/models/user')

// 61bed45f94e01d45b623334a

// User.findByIdAndUpdate('61bed47194e01d45b623334e',{age:1}).then((user)=>{
//     console.log(user)
//     return User.countDocuments({age:1}).then((result)=>{
//         console.log(result)
//     })
// }).catch((e)=>{
//     console.log(e)
// })

const updateAgeAndCount=async (id,age)=>{
const user=await User.findByIdAndUpdate(id,{age})
const count=await User.countDocuments({age})
return count
}

updateAgeAndCount('61bed45f94e01d45b623334a',20).then((data)=>{
console.log(data)
}).catch((e)=>{
    console.log(e)
})