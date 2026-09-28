'use strict';
const { Model } = require('sequelize');
const { VARIANT_STATUS } = require('../constants/inventory');

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      ProductVariant.hasMany(models.InventoryHistory, {
        foreignKey: 'variant_id',
        as: 'histories',
        onDelete: 'CASCADE'
      });
    }
  }

  ProductVariant.init(
    {
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
        }
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      attributes: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
        defaultValue: 10,
        field: 'reorder_level',
        validate: {
          min: 0
        }
      },
      status: {
        type: DataTypes.ENUM(...Object.values(VARIANT_STATUS)),
        allowNull: false,
        defaultValue: VARIANT_STATUS.ACTIVE
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      sequelize,
      modelName: 'ProductVariant',
      tableName: 'product_variants',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['sku']
        },
        {
          fields: ['product_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['available_quantity']
        }
      ]
    }
  );

  return ProductVariant;
};
