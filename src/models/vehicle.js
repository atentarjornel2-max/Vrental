module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM('available', 'unavailable'), defaultValue: 'available' },
    pricePerDay: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
  });
  return Vehicle;
};
