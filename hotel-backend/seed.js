/* eslint-env node */
/* global require, process */
require('dotenv').config();
const { connectDatabase } = require('./config/database');
const Room = require('./models/Room');
const Guest = require('./models/Guest');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

const seedData = async () => {
  try {
    await connectDatabase();
    
    // Clear existing data
    await Payment.destroy({ where: {}, truncate: true, cascade: true });
    await Booking.destroy({ where: {}, truncate: true, cascade: true });
    await Guest.destroy({ where: {}, truncate: true, cascade: true });
    await Room.destroy({ where: {}, truncate: true, cascade: true });
    console.log('🗑️  Cleared existing data');

    // Seed Rooms
    const rooms = [
      // Executive Suite (5 rooms) - GHS 300
      { number: "1", type: "Executive Suite", price: 300, status: "Available", floor: "1st Floor", capacity: 2, features: ["AC", "TV", "WiFi", "King Bed"] },
      { number: "2", type: "Executive Suite", price: 300, status: "Occupied", floor: "1st Floor", capacity: 2, features: ["AC", "TV", "WiFi", "King Bed"] },
      { number: "3", type: "Executive Suite", price: 300, status: "Occupied", floor: "1st Floor", capacity: 2, features: ["AC", "TV", "WiFi", "King Bed"] },
      { number: "4", type: "Executive Suite", price: 300, status: "Available", floor: "2nd Floor", capacity: 2, features: ["AC", "TV", "WiFi", "King Bed"] },
      { number: "5", type: "Executive Suite", price: 300, status: "Cleaning", floor: "2nd Floor", capacity: 2, features: ["AC", "TV", "WiFi", "King Bed"] },
      
      // Deluxe Room (5 rooms) - GHS 250
      { number: "6", type: "Deluxe Room", price: 250, status: "Available", floor: "2nd Floor", capacity: 2, features: ["TV", "WiFi", "Queen Bed"] },
      { number: "7", type: "Deluxe Room", price: 250, status: "Occupied", floor: "2nd Floor", capacity: 2, features: ["TV", "WiFi", "Queen Bed"] },
      { number: "8", type: "Deluxe Room", price: 250, status: "Available", floor: "3rd Floor", capacity: 2, features: ["TV", "WiFi", "Queen Bed"] },
      { number: "9", type: "Deluxe Room", price: 250, status: "Reserved", floor: "3rd Floor", capacity: 2, features: ["TV", "WiFi", "Queen Bed"] },
      { number: "10", type: "Deluxe Room", price: 250, status: "Available", floor: "3rd Floor", capacity: 2, features: ["TV", "WiFi", "Queen Bed"] },
      
      // Standard Room (5 rooms) - GHS 200
      { number: "11", type: "Standard Room", price: 200, status: "Available", floor: "3rd Floor", capacity: 2, features: ["TV", "Double Bed"] },
      { number: "12", type: "Standard Room", price: 200, status: "Occupied", floor: "4th Floor", capacity: 2, features: ["TV", "Double Bed"] },
      { number: "13", type: "Standard Room", price: 200, status: "Available", floor: "4th Floor", capacity: 2, features: ["TV", "Double Bed"] },
      { number: "14", type: "Standard Room", price: 200, status: "Occupied", floor: "4th Floor", capacity: 2, features: ["TV", "Double Bed"] },
      { number: "15", type: "Standard Room", price: 200, status: "Available", floor: "4th Floor", capacity: 2, features: ["TV", "Double Bed"] },
      
      // Budget Room (5 rooms) - GHS 150
      { number: "16", type: "Budget Room", price: 150, status: "Available", floor: "5th Floor", capacity: 1, features: ["Single Bed"] },
      { number: "17", type: "Budget Room", price: 150, status: "Reserved", floor: "5th Floor", capacity: 1, features: ["Single Bed"] },
      { number: "18", type: "Budget Room", price: 150, status: "Available", floor: "5th Floor", capacity: 1, features: ["Single Bed"] },
      { number: "19", type: "Budget Room", price: 150, status: "Reserved", floor: "5th Floor", capacity: 1, features: ["Single Bed"] },
      { number: "20", type: "Budget Room", price: 150, status: "Available", floor: "5th Floor", capacity: 1, features: ["Single Bed"] },
    ];
    
    await Room.bulkCreate(rooms);
    console.log('✅ Seeded 20 rooms');

    // Seed Guests (5 checked-in guests)
    const guests = [
      {
        name: "John Mensah",
        email: "john.mensah@example.com",
        phone: "0241234567",
        address: "Accra, Ghana",
        idType: "National ID",
        idNumber: "GHA-123456789",
        roomNumber: "2",
        roomType: "Executive Suite",
        checkInDate: "2026-03-09",
        checkOutDate: "2026-03-13",
        nights: 4,
        pricePerNight: 300,
        totalAmount: 1200,
        amountPaid: 1200,
        balance: 0,
        paymentStatus: "Paid",
        status: "Checked In"
      },
      {
        name: "Sarah Adu",
        email: "sarah.adu@example.com",
        phone: "0551234567",
        address: "Kumasi, Ghana",
        idType: "Passport",
        idNumber: "P1234567",
        roomNumber: "3",
        roomType: "Executive Suite",
        checkInDate: "2026-03-05",
        checkOutDate: "2026-03-12",
        nights: 7,
        pricePerNight: 300,
        totalAmount: 2100,
        amountPaid: 2100,
        balance: 0,
        paymentStatus: "Paid",
        status: "Checked In"
      },
      {
        name: "Peter Asante",
        email: "peter.asante@example.com",
        phone: "0201234567",
        address: "Takoradi, Ghana",
        idType: "Driver's License",
        idNumber: "DL-987654",
        roomNumber: "7",
        roomType: "Deluxe Room",
        checkInDate: "2026-03-07",
        checkOutDate: "2026-03-11",
        nights: 4,
        pricePerNight: 250,
        totalAmount: 1000,
        amountPaid: 1000,
        balance: 0,
        paymentStatus: "Paid",
        status: "Checked In"
      },
      {
        name: "James Brown",
        email: "james.brown@example.com",
        phone: "0261234567",
        address: "Cape Coast, Ghana",
        idType: "National ID",
        idNumber: "GHA-456789123",
        roomNumber: "12",
        roomType: "Standard Room",
        checkInDate: "2026-03-06",
        checkOutDate: "2026-03-11",
        nights: 5,
        pricePerNight: 200,
        totalAmount: 1000,
        amountPaid: 1000,
        balance: 0,
        paymentStatus: "Paid",
        status: "Checked In"
      },
      {
        name: "Grace Owusu",
        email: "grace.owusu@example.com",
        phone: "0541234567",
        address: "Tema, Ghana",
        idType: "Passport",
        idNumber: "P7654321",
        roomNumber: "14",
        roomType: "Standard Room",
        checkInDate: "2026-03-10",
        checkOutDate: "2026-03-14",
        nights: 4,
        pricePerNight: 200,
        totalAmount: 800,
        amountPaid: 200,
        balance: 600,
        paymentStatus: "Partial",
        status: "Checked In"
      }
    ];
    
    const createdGuests = await Guest.bulkCreate(guests);
    console.log('✅ Seeded 5 guests');

    // Seed Bookings (3 reservations)
    const bookings = [
      {
        guestName: "Mary Johnson",
        email: "mary.johnson@example.com",
        phone: "0271234567",
        roomNumber: "9",
        roomType: "Deluxe Room",
        checkInDate: "2026-03-15",
        checkOutDate: "2026-03-18",
        nights: 3,
        pricePerNight: 250,
        totalAmount: 750,
        depositAmount: 125,
        depositPaid: true,
        paymentMethod: "Cash",
        status: "Reserved"
      },
      {
        guestName: "David Osei",
        email: "david.osei@example.com",
        phone: "0281234567",
        roomNumber: "17",
        roomType: "Budget Room",
        checkInDate: "2026-03-14",
        checkOutDate: "2026-03-16",
        nights: 2,
        pricePerNight: 150,
        totalAmount: 300,
        depositAmount: 75,
        depositPaid: true,
        paymentMethod: "Mobile Money",
        status: "Reserved"
      },
      {
        guestName: "Emma Wilson",
        email: "emma.wilson@example.com",
        phone: "0291234567",
        roomNumber: "19",
        roomType: "Budget Room",
        checkInDate: "2026-03-16",
        checkOutDate: "2026-03-19",
        nights: 3,
        pricePerNight: 150,
        totalAmount: 450,
        depositAmount: 75,
        depositPaid: true,
        paymentMethod: "Card",
        status: "Reserved"
      }
    ];
    
    const createdBookings = await Booking.bulkCreate(bookings);
    console.log('✅ Seeded 3 bookings');

    // Seed Payments (5 transactions)
    const payments = [
      {
        date: "2026-03-11",
        time: "14:30",
        type: "Check-Out",
        room: "7",
        guest: "Peter Asante",
        amount: 1000,
        method: "Cash",
        status: "Completed",
        reference: "TXN001",
        guestId: createdGuests[2].id
      },
      {
        date: "2026-03-11",
        time: "10:15",
        type: "Booking Deposit",
        room: "17",
        guest: "David Osei",
        amount: 75,
        method: "Mobile Money",
        status: "Completed",
        reference: "TXN002",
        bookingId: createdBookings[1].id
      },
      {
        date: "2026-03-10",
        time: "16:45",
        type: "Check-In",
        room: "3",
        guest: "Sarah Adu",
        amount: 2100,
        method: "Card",
        status: "Completed",
        reference: "TXN003",
        guestId: createdGuests[1].id
      },
      {
        date: "2026-03-10",
        time: "13:20",
        type: "Check-In",
        room: "12",
        guest: "James Brown",
        amount: 1000,
        method: "Cash",
        status: "Completed",
        reference: "TXN004",
        guestId: createdGuests[3].id
      },
      {
        date: "2026-03-10",
        time: "09:30",
        type: "Partial Payment",
        room: "14",
        guest: "Grace Owusu",
        amount: 200,
        method: "Mobile Money",
        status: "Completed",
        reference: "TXN005",
        guestId: createdGuests[4].id
      }
    ];
    
    await Payment.bulkCreate(payments);
    console.log('✅ Seeded 5 payments');

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
