# PostgreSQL Setup Instructions for Windows

## Step 1: Download PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download the latest version (16.x recommended)
4. Choose Windows x86-64 installer

## Step 2: Install PostgreSQL

1. Run the downloaded `.exe` file
2. Click "Next" through the Setup Wizard
3. **Installation Directory**: Use default (`C:\Program Files\PostgreSQL\16`)
4. **Select Components**: Keep all checked (PostgreSQL Server, pgAdmin 4, Stack Builder, Command Line Tools)
5. **Data Directory**: Use default
6. **Password**: Set password for `postgres` user (use `postgres` to match .env file)
   - ⚠️ **IMPORTANT**: Remember this password! It must match `DB_PASSWORD` in your `.env` file
7. **Port**: Use default `5432`
8. **Locale**: Use default
9. Click "Next" and "Finish" to complete installation

## Step 3: Verify Installation

Open PowerShell and check if PostgreSQL is installed:
```powershell
psql --version
```

You should see something like: `psql (PostgreSQL) 16.x`

If the command is not found, add PostgreSQL to your PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

## Step 4: Create the Database

Open PowerShell and run:
```powershell
# Connect to PostgreSQL (you'll be prompted for password)
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE jjoj_guesthouse;

# Verify it was created:
\l

# Exit psql:
\q
```

Alternatively, use pgAdmin 4 (GUI):
1. Open pgAdmin 4
2. Connect to PostgreSQL server (localhost)
3. Right-click "Databases" → "Create" → "Database"
4. Database name: `jjoj_guesthouse`
5. Click "Save"

## Step 5: Verify Backend Configuration

Make sure your `.env` file in `hotel-backend` folder has:
```env
PORT=5000
JWT_SECRET=your-secret-key-here-change-in-production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jjoj_guesthouse
DB_USER=postgres
DB_PASSWORD=postgres
```

⚠️ **Important**: `DB_PASSWORD` must match the password you set during PostgreSQL installation!

## Step 6: Seed the Database

From the `hotel-frontend` directory:
```powershell
cd hotel-backend
npm run seed
```

Expected output:
```
✅ PostgreSQL Connected
📊 Database: jjoj_guesthouse
📋 Database tables synced
🗑️  Cleared existing data
✅ Seeded 20 rooms
✅ Seeded 5 guests
✅ Seeded 3 bookings
✅ Seeded 5 payments

🎉 Database seeded successfully!
```

This will populate:
- **20 rooms**: 5 Executive Suite (GHS 300), 5 Deluxe (GHS 250), 5 Standard (GHS 200), 5 Budget (GHS 150)
- **5 checked-in guests**: With payment records
- **3 advance bookings**: Reserved rooms for future dates
- **5 payment transactions**: Check-in, check-out, and deposit payments

## Step 7: Start the Backend Server

```powershell
npm start
```

Expected output:
```
✅ PostgreSQL Connected
📊 Database: jjoj_guesthouse
Server running on http://localhost:5000
```

---

## Testing the API

You can test the API endpoints using:
- **Thunder Client** (VS Code extension)
- **Postman**
- **Browser** (for GET requests)
- **PowerShell** (curl commands)

### Example API Tests:

#### 1. Login (Get JWT Token)
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

#### 2. Get All Rooms
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/rooms" -Method GET -Headers @{Authorization="Bearer $token"}
```

#### 3. Get All Guests
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/guests" -Method GET -Headers @{Authorization="Bearer $token"}
```

#### 4. Get All Bookings
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings" -Method GET -Headers @{Authorization="Bearer $token"}
```

#### 5. Get Payment Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/payments/summary/stats" -Method GET -Headers @{Authorization="Bearer $token"}
```

---

## Troubleshooting

### Error: "Connection refused" or "ECONNREFUSED"
- PostgreSQL is not running
- Check if PostgreSQL service is running:
  ```powershell
  Get-Service *postgres*
  ```
- If not running, start it:
  ```powershell
  Start-Service postgresql-x64-16  # Service name may vary
  ```

### Error: "password authentication failed"
- Password in `.env` file doesn't match PostgreSQL user password
- Update `DB_PASSWORD` in `.env` to match the password you set during installation

### Error: "database does not exist"
- Database `jjoj_guesthouse` was not created
- Follow Step 4 to create the database

### Error: "psql: command not found"
- PostgreSQL bin directory not in PATH
- Add to PATH:
  ```powershell
  $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
  ```
- Or restart your terminal after installation

### Port 5432 already in use
- Another application is using PostgreSQL's port
- Either stop that application or change `DB_PORT` in `.env`

---

## Available API Endpoints

All API endpoints are ready with full CRUD operations:

### Authentication
- `POST /api/auth/login` - Login and get JWT token

### Rooms
- `GET /api/rooms` - Get all rooms (with filters)
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create new room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)
- `GET /api/rooms/available/count` - Get available rooms count

### Guests
- `GET /api/guests` - Get all guests (with search)
- `GET /api/guests/:id` - Get single guest
- `POST /api/guests` - Check-in new guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest (Admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `GET /api/payments` - Get all payments (with filters)
- `GET /api/payments/:id` - Get single payment
- `POST /api/payments` - Record new payment
- `GET /api/payments/summary/stats` - Get payment statistics

---

## User Accounts (for testing)

The backend has 3 pre-configured users:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | Admin | Full access to all features |
| receptionist | recep123 | Receptionist | Check-in, Check-out, Bookings, Room Status |
| manager | manager123 | Manager | View Reports, Payments (no check-in/out) |

---

## Database Schema

### Tables Created by Sequelize:

1. **rooms** - 20 rooms with types, prices, status, features
2. **guests** - Guest check-in records with payment details
3. **bookings** - Advance reservations with deposit info
4. **payments** - Transaction history with references to guests/bookings

All tables have:
- Auto-incrementing integer `id` (primary key)
- `createdAt` and `updatedAt` timestamps (managed by Sequelize)

---

## Next Steps

Once PostgreSQL is set up and seeded:

1. ✅ Backend API is ready on `http://localhost:5000`
2. ✅ Frontend is running on `http://localhost:5175`
3. 🔄 **Next**: Integrate frontend with backend API (replace localStorage with API calls)

