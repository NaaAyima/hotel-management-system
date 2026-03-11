const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const Room = require('../models/Room');
const router = express.Router();

// GET /api/rooms - Get all rooms
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    const rooms = await Room.findAll({ 
      where,
      order: [['number', 'ASC']]
    });
    
    res.json({
      success: true,
      data: rooms,
      count: rooms.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
});

// GET /api/rooms/:id - Get single room
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
});

// PUT /api/rooms/:id - Update room (Admin, Receptionist only)
router.put('/:id', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const [updated] = await Room.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const room = await Room.findByPk(req.params.id);
    
    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
});

// GET /api/rooms/available/count - Get available room count
router.get('/available/count', authMiddleware, async (req, res) => {
  try {
    const availableCount = await Room.count({ where: { status: 'Available' } });
    const totalCount = await Room.count();
    
    res.json({
      success: true,
      data: {
        available: availableCount,
        total: totalCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error counting rooms',
      error: error.message
    });
  }
});

// POST /api/rooms - Create new room (Admin only)
router.post('/', authMiddleware, authorize('Admin'), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
});

// DELETE /api/rooms/:id - Delete room (Admin only)
router.delete('/:id', authMiddleware, authorize('Admin'), async (req, res) => {
  try {
    const deleted = await Room.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
});

module.exports = router;
