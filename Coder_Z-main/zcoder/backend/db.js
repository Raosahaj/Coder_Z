const mongoose = require('mongoose');

const url = "mongodb+srv://neemashubham11:Shubham11@zcoder.re4ty3r.mongodb.net/?retryWrites=true&w=majority&appName=Zcoder"
module.exports.connect = () => {
    mongoose.connect(url).then((res) => {
        console.log("MongoDB connected Successfully")
    }).catch((error) => {
        console.log(error)
    })
}