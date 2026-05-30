const express = require("express");
const facilityRoutes = require("./modules/facility/facility.routes");

const router = express.Router();

router.use("/", facilityRoutes);

module.exports = router;
