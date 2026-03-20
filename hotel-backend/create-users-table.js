require('dotenv').config();
const { connectDatabase, sequelize } = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createUsersAndSync = async () => {
  try {
    await connectDatabase();
    
    // Sync the User model (creates the table if it doesn't exist)
    console.log('🔄 Syncing User table to Neon DB...');
    await User.sync({ alter: true });
    
    // Check if the admin user already exists
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      console.log('👤 Seeding default users...');
      
      const adminPassword = await bcrypt.hash('admin123', 10);
      const recepPassword = await bcrypt.hash('recep123', 10);
      const managerPassword = await bcrypt.hash('manager123', 10);

      await User.bulkCreate([
        {
          username: 'admin',
          password: adminPassword,
          role: 'Admin',
          name: 'Administrator',
          email: 'admin@jjoj.com'
        },
        {
          username: 'receptionist',
          password: recepPassword,
          role: 'Receptionist',
          name: 'Sarah Mensah',
          email: 'receptionist@jjoj.com'
        },
        {
          username: 'manager',
          password: managerPassword,
          role: 'Manager',
          name: 'John Osei',
          email: 'manager@jjoj.com'
        }
      ]);
      console.log('✅ Default users embedded successfully.');
    } else {
      console.log('ℹ️ Default users already exist in the database.');
    }

    console.log('🎉 Done! Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users table:', error);
    process.exit(1);
  }
};

createUsersAndSync();
