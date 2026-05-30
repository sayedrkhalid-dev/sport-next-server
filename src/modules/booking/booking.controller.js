const mongoose = require("mongoose");
const bookingService = require("./booking.service");

const isValidId = (id) => mongoose.isValidObjectId(id);

// ─── POST /bookings ───────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { facility_id, booking_date, time_slot } = req.body;

    const booking = await bookingService.createBooking({
      facility_id,
      booking_date,
      time_slot,
      userEmail: req.user.email, // Populated by protect middleware
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /bookings/my ─────────────────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const bookings = await bookingService.getUserBookings(req.user.email, filters);

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /bookings/my/:id ─────────────────────────────────────────────────────
const getMyBookingById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await bookingService.getBookingById(req.params.id);

    // Make sure booking belongs to the current user
    if (!booking || booking.user_email !== req.user.email) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /bookings/my/:id/cancel ───────────────────────────────────────────
const cancelMyBooking = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.email
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /bookings (Admin Only) ───────────────────────────────────────────────
const getAllBookings = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (date) filters.booking_date = date;

    const bookings = await bookingService.getAllBookings(filters);

    res.status(200).json({
      success: true,
      message: "All bookings retrieved successfully",
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /bookings/:id (Admin Only) ───────────────────────────────────────────
const getBookingById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /bookings/:id/status (Admin Only) ──────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await bookingService.updateBookingStatus(req.params.id, req.body);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getMyBookingById,
  cancelMyBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
};
