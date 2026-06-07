const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    facility_type: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["football", "cricket", "badminton", "basketball", "swimming", "tennis"],
    },
    image: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    price_per_hour: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    available_slots: [
      {
        start_time: { type: String, required: true },
        end_time: { type: String, required: true },
        _id: false,
      },
    ],
    description: { type: String, required: true, trim: true },
    owner_email: { type: String, required: true, lowercase: true, trim: true },
    booking_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", facilitySchema);