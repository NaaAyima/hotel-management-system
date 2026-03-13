const { Sequelize } = require('sequelize');
// Explicitly require pg to force Vercel's static analyzer to include it in the Serverless deployment bundle
require('pg');
require('pg-hstore');

// Support direct DATABASE_URL connection string (preferred for Vercel Serverless)
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.NODE_ENV === 'production' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.NODE_ENV === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    
    // Sync all models with database
    await sequelize.sync({ alter: false }); // Set to true for development (auto-update schema)
    console.log('📋 Database tables synced');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('PostgreSQL connection closed through app termination');
  process.exit(0);
});

module.exports = { sequelize, connectDatabase };

