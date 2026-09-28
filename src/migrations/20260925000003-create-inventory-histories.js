'use strict';
const { ACTION_TYPES } = require('../constants/inventory');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_histories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      variant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'product_variants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action_type: {
        type: Sequelize.ENUM(...Object.values(ACTION_TYPES)),
        allowNull: false
      },
      quantity_change: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      previous_available: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_available: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      previous_reserved: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_reserved: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reference_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('inventory_histories', ['variant_id']);
    await queryInterface.addIndex('inventory_histories', ['created_at']);
    await queryInterface.addIndex('inventory_histories', ['action_type']);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('inventory_histories');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_inventory_histories_action_type";');
  }
};
