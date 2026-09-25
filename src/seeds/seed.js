const { sequelize, Product, ProductVariant, InventoryHistory } = require('../models');
const { INVENTORY_STATUS, INVENTORY_ACTION } = require('../constants/inventory');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connecting to database...');

    // Clear existing data cleanly in correct order
    await InventoryHistory.destroy({ where: {}, truncate: true, cascade: true });
    await ProductVariant.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });

    console.log('Creating initial product...');
    const tshirt = await Product.create({
      name: 'Classic Cotton T-Shirt',
      description: 'Premium quality 100% combed cotton unisex crewneck t-shirt.'
    });

    const variantsData = [
      {
        productId: tshirt.id,
        sku: 'TSHIRT-RED-S',
        attributes: { size: 'Small', color: 'Red' },
        price: 19.99,
        availableQuantity: 50,
        reservedQuantity: 0,
        reorderLevel: 10,
        status: INVENTORY_STATUS.ACTIVE
      },
      {
        productId: tshirt.id,
        sku: 'TSHIRT-RED-M',
        attributes: { size: 'Medium', color: 'Red' },
        price: 21.99,
        availableQuantity: 100,
        reservedQuantity: 10,
        reorderLevel: 20,
        status: INVENTORY_STATUS.ACTIVE
      },
      {
        productId: tshirt.id,
        sku: 'TSHIRT-RED-L',
        attributes: { size: 'Large', color: 'Red' },
        price: 21.99,
        availableQuantity: 75,
        reservedQuantity: 5,
        reorderLevel: 15,
        status: INVENTORY_STATUS.ACTIVE
      },
      {
        productId: tshirt.id,
        sku: 'TSHIRT-BLU-S',
        attributes: { size: 'Small', color: 'Blue' },
        price: 19.99,
        availableQuantity: 30,
        reservedQuantity: 0,
        reorderLevel: 10,
        status: INVENTORY_STATUS.ACTIVE
      }
    ];

    console.log('Creating product variants and initial history...');
    for (const vData of variantsData) {
      const variant = await ProductVariant.create(vData);

      await InventoryHistory.create({
        variantId: variant.id,
        actionType: INVENTORY_ACTION.STOCK_UPDATE,
        quantityChange: variant.availableQuantity,
        previousAvailable: 0,
        newAvailable: variant.availableQuantity,
        previousReserved: 0,
        newReserved: variant.reservedQuantity,
        reason: 'Initial inventory seeding',
        referenceId: 'SEED-INITIAL'
      });
    }

    console.log('Database seeded successfully.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Seeding failed:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
