const { z } = require("zod");

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "Time must be in HH:MM format (e.g. 09:00)",
  });

// ─── Create Booking Schema ───────────────────────────────────────────────────
const createBookingSchema = z.object({
  body: z
    .object({
      facility_id: z
        .string({ required_error: "Facility ID is required" })
        .regex(/^[a-f\d]{24}$/i, { message: "Invalid facility ID" }),

      booking_date: z
        .string({ required_error: "Booking date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .refine(
          (date) => new Date(date) >= new Date(new Date().toDateString()),
          { message: "Booking date cannot be in the past" }
        ),

      time_slot: z
        .object({
          start_time: timeString,
          end_time: timeString,
        })
        .refine((slot) => slot.start_time < slot.end_time, {
          message: "end_time must be after start_time",
          path: ["end_time"],
        }),
    }),
});

// ─── Admin: Update Booking Status ─────────────────────────────────────────────
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "cancelled"], {
      required_error: "Status is required",
    }),
  }),
});

// ─── User: Cancel Booking ─────────────────────────────────────────────────────
const cancelBookingSchema = z.object({
  body: z.object({
    cancellation_reason: z
      .string()
      .trim()
      .min(5, { message: "Please provide a reason (min 5 characters)" })
      .optional(),
  }),
});

module.exports = {
  createBookingSchema,
  updateStatusSchema,
  cancelBookingSchema,
};
