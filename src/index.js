require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (e) {
    console.error('DB connection error', e.message);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other server or set a different PORT in .env.`);
    process.exit(1);
  }

  throw error;
});
