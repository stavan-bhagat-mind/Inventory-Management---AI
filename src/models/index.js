const sequelize = require('../config/database');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const InventoryHistory = require('./InventoryHistory');

// Associations
Product.hasMany(ProductVariant, {
  foreignKey: 'productId',
  as: 'variants',
  onDelete: 'CASCADE'
});

ProductVariant.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

ProductVariant.hasMany(InventoryHistory, {
  foreignKey: 'variantId',
  as: 'histories',
  onDelete: 'CASCADE'
});

InventoryHistory.belongsTo(ProductVariant, {
  foreignKey: 'variantId',
  as: 'variant'
});

module.exports = {
  sequelize,
  Product,
  ProductVariant,
  InventoryHistory
};
