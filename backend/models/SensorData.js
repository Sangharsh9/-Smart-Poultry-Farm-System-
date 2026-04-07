const mongoose = require("mongoose");

const SensorSchema = new mongoose.Schema({

temperature:{
type:Number
},

humidity:{
type:Number
},

ammonia:{
type:Number
},

light:{
type:Number
},

eggCount:{
type:Number,
default:0
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("SensorData", SensorSchema);