const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    facility_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    owner_email: { type: String, required: true, lowercase: true, trim: true },
    booking_date: { type: String, required: true }, // YYYY-MM-DD
    time_slot: {
      start_time: { type: String, required: true },
      end_time: { type: String, required: true },
    },
    hours: { type: Number, required: true },
    total_price: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
