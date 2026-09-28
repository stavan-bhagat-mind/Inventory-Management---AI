'use strict';
const { Model } = require('sequelize');
const { ACTION_TYPES } = require('../constants/inventory');

module.exports = (sequelize, DataTypes) => {
  class InventoryHistory extends Model {
    static associate(models) {
      InventoryHistory.belongsTo(models.ProductVariant, {
        foreignKey: 'variant_id',
        as: 'variant'
      });
    }
  }

  InventoryHistory.init(
    {
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
        }
      },
      actionType: {
        type: DataTypes.ENUM(...Object.values(ACTION_TYPES)),
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
        type: DataTypes.STRING,
        allowNull: true
      },
      referenceId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reference_id'
      }
    },
    {
      sequelize,
      modelName: 'InventoryHistory',
      tableName: 'inventory_histories',
      underscored: true,
      timestamps: true,
      updatedAt: false, // history is immutable
      indexes: [
        {
          fields: ['variant_id']
        },
        {
          fields: ['created_at']
        },
        {
          fields: ['action_type']
        }
      ]
    }
  );

  return InventoryHistory;
};
