module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed'),
      defaultValue: 'pending'
    },
    statusNote: { type: DataTypes.TEXT }
  });
  return Booking;
};
