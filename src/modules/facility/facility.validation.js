const { z } = require("zod");

// HH:MM format validator — e.g. "09:00", "17:30"
const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "Time must be in HH:MM format (e.g. 09:00)",
  });

const slotSchema = z
  .object({
    start_time: timeString,
    end_time: timeString,
  })
  .refine((slot) => slot.start_time < slot.end_time, {
    message: "end_time must be after start_time",
    path: ["end_time"],
  });

const createFacilitySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Facility name is required" })
      .trim()
      .min(3, { message: "Facility name must be at least 3 characters" }),

    description: z
      .string({ required_error: "Description is required" })
      .trim()
      .min(10, { message: "Description must be at least 10 characters" }),

    facility_type: z.enum(
      ["football", "cricket", "badminton", "basketball", "swimming", "tennis"],
      { required_error: "Facility type is required" }
    ),

    location: z
      .string({ required_error: "Location is required" })
      .trim()
      .min(2, { message: "Location must be at least 2 characters" }),

    price_per_hour: z
      .number({ required_error: "Price per hour is required" })
      .positive({ message: "Price must be greater than 0" }),

    capacity: z
      .number({ required_error: "Capacity is required" })
      .int({ message: "Capacity must be an integer" })
      .positive({ message: "Capacity must be greater than 0" }),

    available_slots: z
      .array(slotSchema)
      .min(1, { message: "At least one slot is required" }),

    image: z
      .string({ required_error: "Image URL is required" })
      .url({ message: "Invalid image URL" }),
  }),
});

const updateFacilitySchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(3).optional(),
      description: z.string().trim().min(10).optional(),
      facility_type: z
        .enum(["football", "cricket", "badminton", "basketball", "swimming", "tennis"])
        .optional(),
      location: z.string().trim().min(2).optional(),
      price_per_hour: z.number().positive().optional(),
      capacity: z.number().int().positive().optional(),
      available_slots: z.array(slotSchema).optional(),
      image: z.string().url().optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

module.exports = { createFacilitySchema, updateFacilitySchema };
