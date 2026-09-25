const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { INVENTORY_STATUS } = require('../constants/inventory');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  attributes: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'available_quantity',
    validate: {
      min: 0
    }
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'reserved_quantity',
    validate: {
      min: 0
    }
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'reorder_level',
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM(Object.values(INVENTORY_STATUS)),
    allowNull: false,
    defaultValue: INVENTORY_STATUS.ACTIVE
  }
}, {
  tableName: 'product_variants',
  indexes: [
    {
      unique: true,
      fields: ['sku']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status', 'available_quantity']
    },
    {
      fields: ['reorder_level']
    }
  ]
});

module.exports = ProductVariant;
