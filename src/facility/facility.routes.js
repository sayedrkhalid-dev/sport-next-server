const express = require("express");
const protect = require("../middleware/protect");
const {
  getFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
} = require("./facility.controller");

const router = express.Router();

router.get("/facilities", getFacilities);
router.get("/facilities/:id", getFacility);
router.post("/facilities", protect, createFacility);
router.put("/facilities/:id", protect, updateFacility);
router.delete("/facilities/:id", protect, deleteFacility);

module.exports = router;