const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');
const Customer = require('./customer')(sequelize, DataTypes);
const Vehicle = require('./vehicle')(sequelize, DataTypes);
const Booking = require('./booking')(sequelize, DataTypes);

Customer.hasMany(Booking, { foreignKey: 'customerId' });
Booking.belongsTo(Customer, { foreignKey: 'customerId' });

Vehicle.hasMany(Booking, { foreignKey: 'vehicleId' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

module.exports = { sequelize, Customer, Vehicle, Booking };
