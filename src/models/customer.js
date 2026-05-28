const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
  });

  Customer.beforeCreate(async (user) => {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  });

  Customer.prototype.validatePassword = function (pwd) {
    return bcrypt.compare(pwd, this.password);
  };

  return Customer;
};
