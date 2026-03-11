const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/bookings - Get all bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, date } = req.query;
    
    let where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (date) {
      where.checkInDate = { [Op.lte]: date };
      where.checkOutDate = { [Op.gte]: date };
    }
    
    const bookings = await Booking.findAll({ 
      where,
      order: [['checkInDate', 'ASC']]
    });
    
    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
});

// GET /api/bookings/:id - Get single booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// POST /api/bookings - Create new booking
router.post('/', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      status: 'Reserved'
    };
    
    const booking = await Booking.create(bookingData);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const [updated] = await Booking.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = await Booking.findByPk(req.params.id);
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    await booking.destroy();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

module.exports = router;
