const express = require("express");
const { validateRequest, protect, restrictTo } = require("../auth/auth.middleware");
const {
  createBookingSchema,
  updateStatusSchema,
  cancelBookingSchema,
} = require("./booking.validation");
const {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelMyBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
} = require("./booking.controller");

const router = express.Router();

// ─── User Bookings (Private Routes) ───────────────────────────────────────────
router.post(
  "/bookings",
  protect,
  validateRequest(createBookingSchema),
  createBooking
);

router.get("/bookings/my", protect, getMyBookings);

router.get("/bookings/my/:id", protect, getMyBookingById);

router.patch(
  "/bookings/my/:id/cancel",
  protect,
  validateRequest(cancelBookingSchema),
  cancelMyBooking
);

// ─── Admin Bookings (Admin-Only Private Routes) ───────────────────────────────
router.get("/bookings", protect, restrictTo("admin"), getAllBookings);

router.get("/bookings/:id", protect, restrictTo("admin"), getBookingById);

router.patch(
  "/bookings/:id/status",
  protect,
  restrictTo("admin"),
  validateRequest(updateStatusSchema),
  updateBookingStatus
);

module.exports = router;
