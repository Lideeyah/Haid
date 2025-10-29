// src/controllers/eventController.js

const Event = require('../models/Event');
const User = require('../models/User');
const AidLog = require('../models/AidLog');
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
      ngo: req.user.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      hederaTx,
      createdAt: new Date()
    });
    await event.save();
    // Map to frontend EventDetail shape
    const saved = event.toObject();
    const result = {
      id: String(saved._id),
      name: saved.name,
      type: saved.type,
      location: saved.location,
      description: saved.description,
      quantity: saved.quantity,
      supplies: saved.supplies,
      volunteersCount: (saved.volunteers || []).length,
      volunteers: [],
      totalServed: 0,
      duplicates: 0,
      startTime: saved.startTime ? new Date(saved.startTime).toISOString() : null,
      endTime: saved.endTime ? new Date(saved.endTime).toISOString() : null,
      date: saved.startTime ? new Date(saved.startTime).toISOString() : null,
      createdAt: saved.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: saved.updatedAt ? new Date(saved.updatedAt).toISOString() : new Date().toISOString(),
      hederaTx: saved.hederaTx || null,
    };
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    // If ?all=true and user is admin, return all events. Otherwise, filter by NGO for NGO users.
    const filter = { deleted: { $ne: true } };
    const allParam = req.query.all === 'true' || req.query.all === true;
    if (req.user && req.user.role === 'ngo') {
      if (!allParam) {
        filter.ngo = req.user._id;
      }
      // If allParam and NGO, still restrict to their own events (unless you want NGOs to see all, then remove this block)
    }
    // Only admin can see all events with ?all=true
    // For other roles, default to all events (or restrict as needed)
    if (req.user && req.user.role === 'admin' && allParam) {
      // No additional filter, admin sees all
    }
    const events = await Event.find(filter).populate('volunteers');
    const eventsWithCount = await Promise.all(events.map(async event => {
      const obj = event.toObject();
      // compute totalServed and duplicates from AidLog
      const logs = await AidLog.find({ event: obj._id });
      const totalServed = logs.filter(l => l.status === 'collected').length;
      const duplicates = logs.filter(l => l.status && l.status !== 'collected').length;
      return {
        id: String(obj._id),
        name: obj.name,
        type: obj.type,
        location: obj.location,
        description: obj.description,
        quantity: obj.quantity,
        supplies: obj.supplies || [],
        volunteersCount: (obj.volunteers || []).length,
        volunteers: (obj.volunteers || []).map(v => ({ id: String(v._id), name: v.name, email: v.email, location: v.location || null })),
        totalServed,
        duplicates,
        startTime: obj.startTime ? new Date(obj.startTime).toISOString() : null,
        endTime: obj.endTime ? new Date(obj.endTime).toISOString() : null,
        date: obj.startTime ? new Date(obj.startTime).toISOString() : null,
        createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : null,
        updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : null,
        hederaTx: obj.hederaTx || null,
      };
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
    if (!event || event.deleted) return res.status(404).json({ message: 'Event not found' });
    const obj = event.toObject();
    const logs = await AidLog.find({ event: obj._id });
    const totalServed = logs.filter(l => l.status === 'collected').length;
    const duplicates = logs.filter(l => l.status && l.status !== 'collected').length;
    res.json({
      id: String(obj._id),
      name: obj.name,
      type: obj.type,
      location: obj.location,
      description: obj.description,
      quantity: obj.quantity,
      supplies: obj.supplies || [],
      volunteersCount: (obj.volunteers || []).length,
      volunteers: (obj.volunteers || []).map(v => ({ id: String(v._id), name: v.name, email: v.email, location: v.location || null })),
      totalServed,
      duplicates,
      startTime: obj.startTime ? new Date(obj.startTime).toISOString() : null,
      endTime: obj.endTime ? new Date(obj.endTime).toISOString() : null,
      date: obj.startTime ? new Date(obj.startTime).toISOString() : null,
      createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : null,
      updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : null,
      hederaTx: obj.hederaTx || null,
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

// Update an event (NGO only, must be owner)
exports.updateEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event || event.deleted) return res.status(404).json({ message: 'Event not found' });
    // Only the NGO that created the event or an admin/auditor could edit; enforce NGO ownership
    if (String(event.ngo) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    const updatable = ['name', 'type', 'location', 'description', 'quantity', 'supplies', 'startTime', 'endTime'];
    updatable.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'quantity') event[field] = Number(req.body[field]);
        else if (field === 'startTime' || field === 'endTime') event[field] = new Date(req.body[field]);
        else event[field] = req.body[field];
      }
    });

    await event.save();
    res.json(event);
  } catch (err) {
    next(err);
  }
};

// Soft-delete an event (NGO only, must be owner)
exports.deleteEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event || event.deleted) return res.status(404).json({ message: 'Event not found' });
    if (String(event.ngo) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    // Soft delete
    event.deleted = true;
    await event.save();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};