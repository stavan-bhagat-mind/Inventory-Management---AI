'use strict';
const { VARIANT_STATUS } = require('../constants/inventory');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      attributes: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      available_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserved_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reorder_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      status: {
        type: Sequelize.ENUM(...Object.values(VARIANT_STATUS)),
        allowNull: false,
        defaultValue: VARIANT_STATUS.ACTIVE
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE "product_variants"
      ADD CONSTRAINT "check_available_quantity_non_negative" CHECK ("available_quantity" >= 0),
      ADD CONSTRAINT "check_reserved_quantity_non_negative" CHECK ("reserved_quantity" >= 0),
      ADD CONSTRAINT "check_price_non_negative" CHECK ("price" >= 0);
    `);

    await queryInterface.addIndex('product_variants', ['product_id']);
    await queryInterface.addIndex('product_variants', ['status']);
    await queryInterface.addIndex('product_variants', ['available_quantity']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('product_variants');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_product_variants_status";');
  }
};
