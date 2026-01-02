const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone'
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member'
  },
  category: {
    type: DataTypes.ENUM('doctor', 'dietitian'),
    allowNull: true,
    field: 'category',
    comment: 'Only set for members (doctors/dietitians), null for admin'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'admin',
  hooks: {
    // Password stored in plain text for doctor panel login
    // beforeCreate: async (admin) => {
    //   if (admin.password) {
    //     admin.password = await bcrypt.hash(admin.password, 12);
    //   }
    // },
    // beforeUpdate: async (admin) => {
    //   if (admin.changed('password')) {
    //     admin.password = await bcrypt.hash(admin.password, 12);
    //   }
    // }
  }
});

// Instance methods
Admin.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

Admin.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

Admin.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = Admin;

