# J.J.O.J Guest House - Backend API

REST API backend for J.J.O.J Guest House Management System.

## Tech Stack
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for frontend integration

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation
```bash
cd hotel-backend
npm install
```

### Environment Setup
Create a `.env` file (already created):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=jjoj-guesthouse-secret-key-2026-change-in-production
JWT_EXPIRES_IN=24h
MONGODB_URI=mongodb://localhost:27017/jjoj-guesthouse
FRONTEND_URL=http://localhost:5175
```

### Database Setup
See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed MongoDB installation instructions.

### Seed Database
```bash
npm run seed
```

### Start Server
```bash
npm start
```

Server runs on: **http://localhost:5000**

---

## Authentication

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "username": "admin",
      "role": "Admin",
      "name": "System Administrator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Default Users
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| receptionist | reception123 | Receptionist |
| manager | manager123 | Manager |

### Using JWT Token
Include token in all authenticated requests:
```
Authorization: Bearer <token>
```

---

## API Endpoints

### Rooms API

#### Get All Rooms
**GET** `/api/rooms`

**Query Parameters:**
- `status` (optional): Filter by status (Available, Occupied, Reserved, Cleaning, Maintenance)
- `type` (optional): Filter by type (Executive Suite, Deluxe Room, Standard Room, Budget Room)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 20
}
```

#### Get Single Room
**GET** `/api/rooms/:id`

#### Update Room
**PUT** `/api/rooms/:id` (Admin, Receptionist only)

**Request Body:**
```json
{
  "status": "Cleaning",
  "notes": "Deep cleaning scheduled"
}
```

#### Create Room
**POST** `/api/rooms` (Admin only)

**Request Body:**
```json
{
  "number": "21",
  "type": "Executive Suite",
  "price": 300,
  "status": "Available",
  "floor": "6th Floor",
  "capacity": 2,
  "features": ["AC", "TV", "WiFi", "King Bed"]
}
```

#### Delete Room
**DELETE** `/api/rooms/:id` (Admin only)

#### Get Available Room Count
**GET** `/api/rooms/available/count`

---

### Guests API

#### Get All Guests
**GET** `/api/guests`

**Query Parameters:**
- `status` (optional): Filter by status (Checked In, Checked Out, Reserved)
- `search` (optional): Search by name, room number, or phone

#### Get Single Guest
**GET** `/api/guests/:id`

#### Check-In Guest
**POST** `/api/guests` (Admin, Receptionist only)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0241234567",
  "address": "Accra, Ghana",
  "idType": "National ID",
  "idNumber": "GHA-123456789",
  "roomNumber": "5",
  "roomType": "Executive Suite",
  "checkInDate": "2026-03-12",
  "checkOutDate": "2026-03-15",
  "nights": 3,
  "pricePerNight": 300,
  "totalAmount": 900,
  "amountPaid": 900,
  "balance": 0,
  "paymentStatus": "Paid"
}
```

#### Update Guest
**PUT** `/api/guests/:id` (Admin, Receptionist only)

#### Check-Out Guest
**DELETE** `/api/guests/:id` (Admin, Receptionist only)

---

### Bookings API

#### Get All Bookings
**GET** `/api/bookings`

**Query Parameters:**
- `status` (optional): Filter by status (Reserved, Confirmed, Cancelled, Checked In, Completed)
- `date` (optional): Filter bookings active on specific date

#### Get Single Booking
**GET** `/api/bookings/:id`

#### Create Booking
**POST** `/api/bookings` (Admin, Receptionist only)

**Request Body:**
```json
{
  "guestName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0271234567",
  "roomNumber": "10",
  "roomType": "Deluxe Room",
  "checkInDate": "2026-03-20",
  "checkOutDate": "2026-03-23",
  "nights": 3,
  "pricePerNight": 250,
  "totalAmount": 750,
  "depositAmount": 125,
  "depositPaid": true,
  "paymentMethod": "Cash",
  "specialRequests": "Late check-in"
}
```

#### Update Booking
**PUT** `/api/bookings/:id` (Admin, Receptionist only)

#### Cancel Booking
**DELETE** `/api/bookings/:id` (Admin, Receptionist only)

---

### Payments API

#### Get All Payments
**GET** `/api/payments` (Admin, Manager only)

**Query Parameters:**
- `type` (optional): Filter by type (Check-In, Check-Out, Booking Deposit, etc.)
- `method` (optional): Filter by method (Cash, Card, Mobile Money, Bank Transfer)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "total": 4375
}
```

#### Get Single Payment
**GET** `/api/payments/:id` (Admin, Manager only)

#### Record Payment
**POST** `/api/payments` (Admin, Receptionist only)

**Request Body:**
```json
{
  "type": "Check-In",
  "room": "5",
  "guest": "John Doe",
  "amount": 900,
  "method": "Cash",
  "guestId": "65f8a1b2c3d4e5f6g7h8i9j0"
}
```

#### Get Payment Statistics
**GET** `/api/payments/summary/stats` (Admin, Manager only)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAmount": 4375,
    "totalTransactions": 5,
    "byMethod": {
      "Cash": 2000,
      "Mobile Money": 275,
      "Card": 2100,
      "Bank Transfer": 0
    }
  }
}
```

---

## Role-Based Access Control

| Endpoint | Admin | Receptionist | Manager |
|----------|-------|--------------|---------|
| View Rooms | ✅ | ✅ | ✅ |
| Update Rooms | ✅ | ✅ | ❌ |
| Create/Delete Rooms | ✅ | ❌ | ❌ |
| View Guests | ✅ | ✅ | ✅ |
| Manage Guests | ✅ | ✅ | ❌ |
| Manage Bookings | ✅ | ✅ | ❌ |
| View Payments | ✅ | ❌ | ✅ |
| Record Payments | ✅ | ✅ | ❌ |

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Models

### Room Schema
```javascript
{
  number: String (unique),
  type: String (enum),
  price: Number,
  status: String (enum),
  features: [String],
  floor: String,
  capacity: Number,
  lastCleaned: Date,
  notes: String
}
```

### Guest Schema
```javascript
{
  name: String,
  email: String,
  phone: String,
  address: String,
  idType: String (enum),
  idNumber: String,
  roomNumber: String,
  roomType: String,
  checkInDate: String,
  checkOutDate: String,
  nights: Number,
  pricePerNight: Number,
  totalAmount: Number,
  amountPaid: Number,
  balance: Number,
  paymentStatus: String (enum),
  status: String (enum),
  specialRequests: String,
  notes: String
}
```

### Booking Schema
```javascript
{
  guestName: String,
  email: String,
  phone: String,
  roomNumber: String,
  roomType: String,
  checkInDate: String,
  checkOutDate: String,
  nights: Number,
  pricePerNight: Number,
  totalAmount: Number,
  depositAmount: Number,
  depositPaid: Boolean,
  paymentMethod: String (enum),
  status: String (enum),
  specialRequests: String,
  notes: String,
  bookingDate: Date
}
```

### Payment Schema
```javascript
{
  date: String,
  time: String,
  type: String (enum),
  room: String,
  guest: String,
  amount: Number,
  method: String (enum),
  status: String (enum),
  reference: String (unique),
  notes: String,
  guestId: ObjectId (ref: Guest),
  bookingId: ObjectId (ref: Booking)
}
```

---

## Development

### Project Structure
```
hotel-backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # JWT authentication & authorization
├── models/
│   ├── Room.js              # Room model
│   ├── Guest.js             # Guest model
│   ├── Booking.js           # Booking model
│   └── Payment.js           # Payment model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── rooms.js             # Rooms routes
│   ├── guests.js            # Guests routes
│   ├── bookings.js          # Bookings routes
│   └── payments.js          # Payments routes
├── .env                     # Environment variables
├── server.js                # Express server setup
├── seed.js                  # Database seeding script
└── package.json             # Dependencies

```

### Testing with Thunder Client / Postman
1. Import API endpoints
2. Login to get JWT token
3. Add token to Authorization header
4. Test all CRUD operations

---

## Next Steps

1. **Setup MongoDB** - Follow instructions in `MONGODB_SETUP.md`
2. **Seed Database** - Run `npm run seed` to populate initial data
3. **Start Backend** - Run `npm start`
4. **Test APIs** - Use Postman/Thunder Client or integrate with frontend
5. **Frontend Integration** - Update frontend to use API endpoints

---

## Support

For issues or questions:
- Check MongoDB connection in `.env`
- Verify MongoDB service is running
- Check server logs for errors
- Ensure JWT token is included in requests
