// src/controllers/donorController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Donor dashboard: high-level KPIs, progress, geographic impact (no personal data)
exports.getDashboard = async (req, res, next) => {
  try {
    // Total recipients served (unique beneficiaries with collected aid)
    const uniqueBeneficiaries = await prisma.aidLog.findMany({
      where: { status: "collected" },
      distinct: ["beneficiaryId"],
    });
    const recipientsServed = uniqueBeneficiaries.length;
    // Distribution progress: total events, events completed (endTime < now)
    const totalEvents = await prisma.event.count();
    const completedEvents = await prisma.event.count({
      where: { endTime: { lt: new Date() } }
    });
    // Geographic impact: count of events per location
    const eventsByLocation = await prisma.event.groupBy({
      by: ['location'],
      _count: { id: true }
    });
    // Format heatmap data
    const geographicImpact = eventsByLocation.map(loc => ({
      location: loc.location,
      events: loc._count.id
    }));
    res.json({
      recipientsServed,
      distributionProgress: {
        totalEvents,
        completedEvents,
        percentCompleted: totalEvents ? Math.round((completedEvents / totalEvents) * 100) : 0
      },
      geographicImpact
    });
  } catch (err) {
    next(err);
  }
};
