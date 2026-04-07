const Sensor = require("../models/SensorData");

exports.addSensorData = async(req,res)=>{

try{

const data = new Sensor(req.body);

await data.save();

res.status(200).json(data);

}
catch(err){

res.status(500).json(err);

}

};

exports.getSensorData = async(req,res)=>{

try{

const data = await Sensor.find()
.sort({createdAt:-1})
.limit(10);

res.json(data);

}
catch(err){

res.status(500).json(err);

}

};