const express = require("express");
const protect = require("../middleware/protect");
const { createBooking, getMyBookings, cancelBooking } = require("./booking.controller");

const router = express.Router();

router.post("/bookings", protect, createBooking);
router.get("/bookings/my", protect, getMyBookings);
router.patch("/bookings/:id/cancel", protect, cancelBooking);

module.exports = router;