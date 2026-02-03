const express = require("express");
const router = express.Router();
const controller = require("../controllers/simulationController");

router.post("/day", controller.simulateOpdDay);

module.exports = router;
