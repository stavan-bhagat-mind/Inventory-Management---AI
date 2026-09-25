const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { INVENTORY_ACTION } = require('../constants/inventory');

const InventoryHistory = sequelize.define('InventoryHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'variant_id',
    references: {
      model: 'product_variants',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  actionType: {
    type: DataTypes.ENUM(Object.values(INVENTORY_ACTION)),
    allowNull: false,
    field: 'action_type'
  },
  quantityChange: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity_change'
  },
  previousAvailable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'previous_available'
  },
  newAvailable: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'new_available'
  },
  previousReserved: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'previous_reserved'
  },
  newReserved: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'new_reserved'
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  referenceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reference_id'
  }
}, {
  tableName: 'inventory_histories',
  indexes: [
    {
      fields: ['variant_id', 'created_at']
    },
    {
      fields: ['action_type']
    }
  ]
});

module.exports = InventoryHistory;
