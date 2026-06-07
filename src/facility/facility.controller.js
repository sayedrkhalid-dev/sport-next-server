const Facility = require("./facility.model");

// GET /facilities — public, with search & filter (Challenge requirement)
const getFacilities = async (req, res) => {
  try {
    const { search, facility_type, location } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (facility_type) {
      const types = facility_type.split(",").map((t) => t.trim().toLowerCase());
      filter.facility_type = { $in: types };
    }
    if (location) {
      filter.location = { $regex: location, $options: "i" };
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
    const facility = await Facility.create({
      ...req.body,
      owner_email: req.user.email, // auto-fill from session
    });
    res.status(201).json({ success: true, data: facility });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /facilities/:id — private, owner only
const updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    if (facility.owner_email !== req.user.email) {
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
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    if (facility.owner_email !== req.user.email) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Facility.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Facility deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFacilities, getFacility, createFacility, updateFacility, deleteFacility };