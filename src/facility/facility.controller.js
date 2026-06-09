const Facility = require("./facility.model");

// GET /facilities — public
const getFacilities = async (req, res) => {
  try {
    const { facility_type, location, min_price, max_price, search } = req.query;

    const filter = {};

    if (facility_type) filter.facility_type = facility_type;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (search) filter.name = { $regex: search, $options: "i" };
    if (min_price || max_price) {
      filter.price_per_hour = {};
      if (min_price) filter.price_per_hour.$gte = Number(min_price);
      if (max_price) filter.price_per_hour.$lte = Number(max_price);
    }

    const facilities = await Facility.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: facilities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /facilities/:id — public
const getFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    res.json({ success: true, data: facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /facilities — private
const createFacility = async (req, res) => {
  try {
    const { owner_email } = req.body;
    if (!owner_email) return res.status(400).json({ message: "owner_email is required" });

    const facility = await Facility.create(req.body);
    res.status(201).json({ success: true, data: facility });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /facilities/:id — private, owner only
const updateFacility = async (req, res) => {
  try {
    const { owner_email } = req.body;
    if (!owner_email) return res.status(400).json({ message: "owner_email is required" });

    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    if (facility.owner_email !== owner_email) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Facility.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /facilities/:id — private, owner only
const deleteFacility = async (req, res) => {
  try {
    const { owner_email } = req.body;
    if (!owner_email) return res.status(400).json({ message: "owner_email is required" });

    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    if (facility.owner_email !== owner_email) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Facility.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Facility deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFacilities, getFacility, createFacility, updateFacility, deleteFacility };
