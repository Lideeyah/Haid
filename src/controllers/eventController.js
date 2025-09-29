// src/controllers/eventController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

exports.createEvent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, type, location, startTime, endTime } = req.body;
    const event = await prisma.event.create({
      data: {
        name,
        type,
        location,
        createdBy: req.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany();
    res.json(events);
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
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};
