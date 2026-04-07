const express = require("express");
const router = express.Router();

const {
addSensorData,
getSensorData
} = require("../controllers/sensorController");

router.post("/add", addSensorData);

router.get("/all", getSensorData);

module.exports = router;