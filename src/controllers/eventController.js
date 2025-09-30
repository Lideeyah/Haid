// src/controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const { submitMessage } = require("../utils/hedera");

exports.createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, type, location, description, quantity, supplies, startTime, endTime } = req.body;
    // Generate UUID for event before Hedera submission
    const { v4: uuidv4 } = require('uuid');
    const eventId = uuidv4();

    // Submit event creation to Hedera Consensus Service with eventId
    let hederaTx = null;
    if (!process.env.HEDERA_TOPIC_ID) {
      return res.status(500).json({ message: "Hedera topic not configured." });
    }
    try {
      const rawTx = await submitMessage(process.env.HEDERA_TOPIC_ID, {
        type: "event_created",
        eventId,
        ngoId: req.user.id,
        timestamp: Date.now(),
      });
      hederaTx = {
        status: rawTx.status,
        transactionId: rawTx.transactionId,
        sequenceNumber: Number(rawTx.sequenceNumber),
        runningHash: rawTx.runningHash,
      };
    } catch (hcsErr) {
      // Blockchain anchoring failed, do not create event
      console.error("Hedera HCS error:", hcsErr);
      return res.status(500).json({ message: "Failed to anchor event on blockchain." });
    }

    // Only create event in DB if Hedera succeeded, using the same UUID
    const event = new Event({
      name,
      type,
      location,
      description,
      quantity: quantity ? Number(quantity) : null,
      supplies: supplies || [],
      volunteers: [],
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      hederaTx,
      createdAt: new Date()
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({}).populate('volunteers');
    // Add volunteersCount to each event
    const eventsWithCount = events.map(event => ({
      ...event.toObject(),
      volunteersCount: event.volunteers.length
    }));
    res.json(eventsWithCount);
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('volunteers');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // For totalServed and duplicates, you may need to refactor AidLog queries as well
    res.json({
      ...event.toObject(),
      volunteersCount: event.volunteers.length,
      volunteers: event.volunteers,
      location: event.location
    });
  } catch (err) {
    next(err);
  }
};

// Assign volunteer to event (NGO only)
exports.assignVolunteer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { eventId, volunteerId } = req.body;
    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // Check volunteer exists and is a volunteer
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    // Check if already assigned
    if (event.volunteers.includes(volunteerId)) {
      return res.status(400).json({ message: 'Volunteer already assigned to event' });
    }
    // Assign volunteer
    event.volunteers.push(volunteerId);
    await event.save();
    res.json({ message: 'Volunteer assigned to event' });
  } catch (err) {
    next(err);
  }
};