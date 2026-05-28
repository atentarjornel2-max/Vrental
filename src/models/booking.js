module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'cancelled'), defaultValue: 'active' }
  });
  return Booking;
};
