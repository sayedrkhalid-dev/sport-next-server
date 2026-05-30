const Booking = require("./booking.model");
const Facility = require("../facility/facility.model");

// ─── Helper: HH:MM to minutes ─────────────────────────────────────────────────
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// ─── Helper: calculate duration in hours ──────────────────────────────────────
const calcDurationHours = (start, end) => {
  return (toMinutes(end) - toMinutes(start)) / 60;
};

// ─── Create Booking ───────────────────────────────────────────────────────────
const createBooking = async ({ facility_id, booking_date, time_slot, userEmail }) => {
  // 1. Check if Facility exists and is active
  const facility = await Facility.findOne({ _id: facility_id, is_active: true });
  if (!facility) {
    const error = new Error("Facility not found");
    error.status = 404;
    throw error;
  }

  // 2. Check if requested slot is available in the facility
  const slotExists = facility.available_slots.some(
    (s) => s.start_time === time_slot.start_time && s.end_time === time_slot.end_time
  );
  if (!slotExists) {
    const error = new Error(
      `Slot ${time_slot.start_time}–${time_slot.end_time} is not available for this facility`
    );
    error.status = 400;
    throw error;
  }

  // 3. Check for existing active booking for this slot
  const existingBooking = await Booking.findOne({
    facility_id,
    booking_date,
    "time_slot.start_time": time_slot.start_time,
    "time_slot.end_time": time_slot.end_time,
    status: { $ne: "cancelled" }, // Cancelled bookings are filterable
  });
  if (existingBooking) {
    const error = new Error(
      `This slot is already booked for ${booking_date}. Please choose another slot or date.`
    );
    error.status = 409;
    throw error;
  }

  // 4. Calculate total price
  const hours = calcDurationHours(time_slot.start_time, time_slot.end_time);
  const total_price = hours * facility.price_per_hour;

  // 5. Create the booking document
  const booking = await Booking.create({
    facility_id,
    user_email: userEmail,
    booking_date,
    time_slot,
    hours,
    total_price,
    status: "pending",
  });

  // 6. Increment booking count on facility
  await Facility.findByIdAndUpdate(facility_id, {
    $inc: { booking_count: 1 },
  });

  // Return populated booking
  return await booking.populate([
    { path: "facility_id", select: "name location facility_type price_per_hour image" },
  ]);
};

// ─── Get all bookings (Admin) ─────────────────────────────────────────────────
const getAllBookings = async (filters = {}) => {
  return await Booking.find(filters)
    .populate("facility_id", "name location facility_type price_per_hour image")
    .sort({ createdAt: -1 });
};

// ─── Get bookings of a specific user ─────────────────────────────────────────
const getUserBookings = async (userEmail, filters = {}) => {
  return await Booking.find({ user_email: userEmail, ...filters })
    .populate("facility_id", "name location facility_type price_per_hour image")
    .sort({ createdAt: -1 });
};

// ─── Get single booking by ID ─────────────────────────────────────────────────
const getBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("facility_id", "name location facility_type price_per_hour image");
};

// ─── Admin: Update booking status ─────────────────────────────────────────────
const updateBookingStatus = async (id, { status }) => {
  return await Booking.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  ).populate("facility_id", "name location");
};

// ─── User: Cancel own booking ─────────────────────────────────────────────────
const cancelBooking = async (id, userEmail) => {
  const booking = await Booking.findOne({ _id: id, user_email: userEmail });

  if (!booking) {
    const error = new Error("Booking not found");
    error.status = 404;
    throw error;
  }

  if (booking.status === "cancelled") {
    const error = new Error("Booking is already cancelled");
    error.status = 400;
    throw error;
  }

  // Soft cancel: mark status as cancelled
  return await Booking.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "cancelled",
      },
    },
    { new: true }
  ).populate("facility_id", "name location");
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};
