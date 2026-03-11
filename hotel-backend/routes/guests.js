const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const Guest = require('../models/Guest');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/guests - Get all guests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { roomNumber: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const guests = await Guest.findAll({ 
      where,
      order: [['checkInDate', 'DESC']]
    });
    
    res.json({
      success: true,
      data: guests,
      count: guests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching guests',
      error: error.message
    });
  }
});

// GET /api/guests/:id - Get single guest
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }
    
    res.json({
      success: true,
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching guest',
      error: error.message
    });
  }
});

// POST /api/guests - Create new guest (check-in)
router.post('/', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const guestData = {
      ...req.body,
      status: 'Checked In'
    };
    
    const guest = await Guest.create(guestData);
    
    res.status(201).json({
      success: true,
      message: 'Guest checked in successfully',
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking in guest',
      error: error.message
    });
  }
});

// PUT /api/guests/:id - Update guest
router.put('/:id', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const [updated] = await Guest.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }
    
    const guest = await Guest.findByPk(req.params.id);
    
    res.json({
      success: true,
      message: 'Guest updated successfully',
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating guest',
      error: error.message
    });
  }
});

// DELETE /api/guests/:id - Delete guest (checkout)
router.delete('/:id', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const guest = await Guest.findByPk(req.params.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }
    
    await guest.destroy();
    
    res.json({
      success: true,
      message: 'Guest checked out successfully',
      data: guest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking out guest',
      error: error.message
    });
  }
});

module.exports = router;
