const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/payments - Get all payments
router.get('/', authMiddleware, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { type, method, startDate, endDate } = req.query;
    
    let where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (method) {
      where.method = method;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }
    
    const payments = await Payment.findAll({ 
      where,
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    const total = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    res.json({
      success: true,
      data: payments,
      count: payments.length,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
});

// GET /api/payments/:id - Get single payment
router.get('/:id', authMiddleware, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
});

// POST /api/payments - Record new payment
router.post('/', authMiddleware, authorize('Admin', 'Receptionist'), async (req, res) => {
  try {
    const count = await Payment.count();
    const paymentData = {
      ...req.body,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      reference: `TXN${String(count + 1).padStart(3, '0')}`,
      status: 'Completed'
    };
    
    const payment = await Payment.create(paymentData);
    
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
});

// GET /api/payments/summary/stats - Get payment statistics
router.get('/summary/stats', authMiddleware, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const payments = await Payment.findAll();
    const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalTransactions = payments.length;
    
    const byMethod = {
      Cash: payments.filter(p => p.method === 'Cash').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      'Mobile Money': payments.filter(p => p.method === 'Mobile Money').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      Card: payments.filter(p => p.method === 'Card').reduce((sum, p) => sum + parseFloat(p.amount), 0),
      'Bank Transfer': payments.filter(p => p.method === 'Bank Transfer').reduce((sum, p) => sum + parseFloat(p.amount), 0)
    };
    
    res.json({
      success: true,
      data: {
        totalAmount,
        totalTransactions,
        byMethod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
});

module.exports = router;
