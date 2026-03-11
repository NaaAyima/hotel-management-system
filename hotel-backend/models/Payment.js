const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Check-In', 'Check-Out', 'Booking Deposit', 'Partial Payment', 'Full Payment', 'Refund'),
    allowNull: false
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guest: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('Cash', 'Card', 'Mobile Money', 'Bank Transfer'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Completed', 'Pending', 'Failed', 'Refunded'),
    defaultValue: 'Completed'
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  guestId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'guests',
      key: 'id'
    }
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id'
    }
  }
}, {
  tableName: 'payments',
  timestamps: true
});

module.exports = Payment;

