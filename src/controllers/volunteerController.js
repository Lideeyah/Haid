// src/controllers/volunteerController.js

const User = require('../models/User');
const Event = require('../models/Event');

// Get all volunteers
exports.getAllVolunteers = async (req, res, next) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' });
    // Optionally, populate assigned events if you store event references
    res.json(volunteers);
  } catch (err) {
    next(err);
  }
};

// Get single volunteer by ID
exports.getVolunteer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.json(volunteer);
  } catch (err) {
    next(err);
  }
};
