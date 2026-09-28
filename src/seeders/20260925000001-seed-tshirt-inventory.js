'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, _Sequelize) {
    const productId = '11111111-1111-1111-1111-111111111111';

    // Insert Product
    await queryInterface.bulkInsert('products', [
      {
        id: productId,
        name: 'Classic Cotton T-Shirt',
        description: 'Premium quality 100% combed cotton crew neck t-shirt.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Insert Variants
    const variants = [
      {
        id: '22222222-2222-2222-2222-222222222201',
        product_id: productId,
        sku: 'TSHIRT-RED-S',
        attributes: JSON.stringify({ size: 'Small', color: 'Red' }),
        price: 19.99,
        available_quantity: 50,
        reserved_quantity: 5,
        reorder_level: 10,
        status: 'ACTIVE',
        version: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222202',
        product_id: productId,
        sku: 'TSHIRT-RED-M',
        attributes: JSON.stringify({ size: 'Medium', color: 'Red' }),
        price: 21.99,
        available_quantity: 100,
        reserved_quantity: 0,
        reorder_level: 20,
        status: 'ACTIVE',
        version: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222203',
        product_id: productId,
        sku: 'TSHIRT-RED-L',
        attributes: JSON.stringify({ size: 'Large', color: 'Red' }),
        price: 23.99,
        available_quantity: 35,
        reserved_quantity: 2,
        reorder_level: 15,
        status: 'ACTIVE',
        version: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222204',
        product_id: productId,
        sku: 'TSHIRT-BLUE-S',
        attributes: JSON.stringify({ size: 'Small', color: 'Blue' }),
        price: 19.99,
        available_quantity: 12,
        reserved_quantity: 0,
        reorder_level: 10,
        status: 'ACTIVE',
        version: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('product_variants', variants);

    // Initial Inventory History Records
    const histories = variants.map(v => ({
      id: uuidv4(),
      variant_id: v.id,
      action_type: 'STOCK_UPDATE',
      quantity_change: v.available_quantity,
      previous_available: 0,
      new_available: v.available_quantity,
      previous_reserved: 0,
      new_reserved: v.reserved_quantity,
      reason: 'Initial stock intake seed',
      reference_id: 'SEED-INIT-001',
      created_at: new Date()
    }));

    await queryInterface.bulkInsert('inventory_histories', histories);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete('inventory_histories', null, {});
    await queryInterface.bulkDelete('product_variants', null, {});
    await queryInterface.bulkDelete('products', null, {});
  }
};
