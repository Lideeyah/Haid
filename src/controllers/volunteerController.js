// src/controllers/volunteerController.js
const mongoose = require("mongoose");
const User = require('../models/User');
const Event = require('../models/Event');
const AidLog = require('../models/AidLog');


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

// Get volunteer activity summary (admin, NGO)
exports.getVolunteerActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Use volunteer DID to find AidLogs (if present)
    const did = volunteer.did;
    const now = new Date();
    const days30 = new Date(now); days30.setDate(now.getDate() - 30);
    const days7 = new Date(now); days7.setDate(now.getDate() - 7);
    const days1 = new Date(now); days1.setDate(now.getDate() - 1);

    const logsAll = did ? await AidLog.find({ did }) : [];
    const logs30 = did ? await AidLog.find({ did, timestamp: { $gte: days30 } }) : [];
    const logs7 = did ? await AidLog.find({ did, timestamp: { $gte: days7 } }) : [];
    const logs1 = did ? await AidLog.find({ did, timestamp: { $gte: days1 } }) : [];

    const lastActivity = logsAll.length ? logsAll.reduce((a, b) => a.timestamp > b.timestamp ? a : b).timestamp : null;

    // Activeness score: weighted metric based on recent logs and assigned events
    const assignedEventsCount = await Event.countDocuments({ volunteers: volunteer._id });
    const activenessScore = Math.round(
      (logs30.length * 0.5 + logs7.length * 0.3 + logs1.length * 0.2 + assignedEventsCount * 0.1) * 10
    ) / 10;

    res.json({
      volunteerId: volunteer._id,
      did,
      lastActivity,
      logsCount: logsAll.length,
      logsLast30Days: logs30.length,
      logsLast7Days: logs7.length,
      logsLast1Day: logs1.length,
      assignedEventsCount,
      activenessScore
    });
  } catch (err) {
    next(err);
  }
};

// Get volunteer rating (average and details)
exports.getVolunteerRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await User.findById(id).populate('ratings.by', 'name email');
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    const ratings = volunteer.ratings || [];
    const avg = ratings.length ? (ratings.reduce((s, r) => s + (r.score || 0), 0) / ratings.length) : 0;
    res.json({ volunteerId: volunteer._id, averageRating: Math.round(avg * 10) / 10, count: ratings.length, ratings });
  } catch (err) {
    next(err);
  }
};


// PATCH /api/volunteers/:id/ngo - set volunteer's NGO
exports.setVolunteerNGO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ngoId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({ message: "Invalid NGO id" });
    }
    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== "ngo") {
      return res.status(404).json({ message: "NGO not found" });
    }
    volunteer.ngo = ngoId;
    await volunteer.save();
    res.json({ message: "NGO set for volunteer", ngo: ngoId });
  } catch (err) {
    next(err);
  }
};

// GET /api/volunteers/:id/scans - get all scans by volunteer
exports.getVolunteerScans = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scans = await AidLog.find({ volunteer: id })
      .populate("event")
      .sort({ timestamp: -1 });
    res.json(
      scans.map((scan) => ({
        id: scan._id,
        event: scan.event
          ? {
              id: scan.event._id,
              name: scan.event.name,
              location: scan.event.location,
            }
          : null,
        did: scan.did,
        status: scan.status,
        timestamp: scan.timestamp,
        hederaTx: scan.hederaTx || null,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/volunteers/:id/events?date=YYYY-MM-DD&status=upcoming|completed
exports.getVolunteerEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, status } = req.query;
    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    let filter = { volunteers: id };
    const now = new Date();
    if (date) {
      const d = new Date(date);
      filter.startTime = { $lte: new Date(d.setHours(23, 59, 59, 999)) };
      filter.endTime = { $gte: new Date(d.setHours(0, 0, 0, 0)) };
    }
    if (status === "upcoming") {
      filter.startTime = { $gt: now };
    } else if (status === "completed") {
      filter.endTime = { $lt: now };
    }
    const events = await Event.find(filter).sort({ startTime: 1 });
    res.json(
      events.map((e) => ({
        id: e._id,
        name: e.name,
        location: e.location,
        startTime: e.startTime,
        endTime: e.endTime,
        type: e.type,
        description: e.description,
        quantity: e.quantity,
        supplies: e.supplies,
        createdAt: e.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/volunteers/:id/stats - aggregate stats for volunteer
exports.getVolunteerStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const volunteer = await User.findById(id);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    // Scans
    const scans = await AidLog.find({ volunteer: id, status: "collected" });
    const totalScans = scans.length;
    // Events completed
    const now = new Date();
    const eventsCompleted = await Event.countDocuments({
      volunteers: id,
      endTime: { $lt: now },
    });
    // People helped (unique DIDs)
    const peopleHelped = new Set(scans.map((s) => s.did)).size;
    // Total hours (sum of event durations for completed events)
    const completedEvents = await Event.find({
      volunteers: id,
      endTime: { $lt: now },
    });
    let totalHours = 0;
    completedEvents.forEach((e) => {
      if (e.startTime && e.endTime) {
        totalHours += (e.endTime - e.startTime) / (1000 * 60 * 60);
      }
    });
    // Volunteer score (simple formula: eventsCompleted + peopleHelped + totalScans/10 + avgRating)
    const ratings = volunteer.ratings || [];
    const avgRating = ratings.length
      ? ratings.reduce((s, r) => s + (r.score || 0), 0) / ratings.length
      : 0;
    const volunteerScore =
      Math.round(
        (eventsCompleted + peopleHelped + totalScans / 10 + avgRating) * 10
      ) / 10;
    res.json({
      volunteerId: id,
      totalScans,
      eventsCompleted,
      peopleHelped,
      totalHours: Math.round(totalHours * 10) / 10,
      volunteerScore,
      avgRating,
    });
  } catch (err) {
    next(err);
  }
};