const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Guest = sequelize.define('Guest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  idType: {
    type: DataTypes.ENUM('Passport', 'National ID', "Driver's License", 'Other'),
    allowNull: false
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roomType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  checkInDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  checkOutDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nights: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paymentStatus: {
    type: DataTypes.ENUM('Paid', 'Partial', 'Pending'),
    defaultValue: 'Pending'
  },
  status: {
    type: DataTypes.ENUM('Checked In', 'Checked Out', 'Reserved'),
    defaultValue: 'Checked In'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'guests',
  timestamps: true
});

module.exports = Guest;

