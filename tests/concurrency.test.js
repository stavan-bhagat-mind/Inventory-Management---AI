const request = require('supertest');
const app = require('../src/app');
const { sequelize, Product, ProductVariant } = require('../src/models');
const { INVENTORY_STATUS } = require('../src/constants/inventory');

describe('Concurrency & Race Condition Handling Tests', () => {
  let testProduct;
  let testVariant;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await ProductVariant.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });

    testProduct = await Product.create({
      name: 'Limited Edition Sneakers',
      description: 'High demand drop with strictly limited stock'
    });

    testVariant = await ProductVariant.create({
      productId: testProduct.id,
      sku: 'SNEAKER-LTD-10',
      attributes: { size: '10' },
      price: 150.00,
      availableQuantity: 10,
      reservedQuantity: 0,
      reorderLevel: 2,
      status: INVENTORY_STATUS.ACTIVE
    });
  });

  it('should safely handle 10 concurrent reservation requests for limited stock without overselling', async () => {
    // 10 concurrent requests, each asking for 2 units = 20 total units requested.
    // Only 10 available, so exactly 5 must succeed, and 5 must fail with 409 Conflict.
    const concurrentRequests = Array.from({ length: 10 }, (_, index) =>
      request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({
          quantity: 2,
          reason: `Concurrent client #${index + 1}`,
          referenceId: `CONCUR-REQ-${index + 1}`
        })
    );

    const responses = await Promise.all(concurrentRequests);

    const successful = responses.filter((r) => r.statusCode === 200);
    const conflicts = responses.filter((r) => r.statusCode === 409);

    expect(successful.length).toBe(5);
    expect(conflicts.length).toBe(5);

    // Verify database state integrity
    const updatedVariant = await ProductVariant.findByPk(testVariant.id);
    expect(updatedVariant.availableQuantity).toBe(0);
    expect(updatedVariant.reservedQuantity).toBe(10);
    expect(updatedVariant.status).toBe(INVENTORY_STATUS.OUT_OF_STOCK);
  });

  it('should safely handle concurrent release requests without over-releasing', async () => {
    // Setup variant with 10 reserved units
    await testVariant.update({ availableQuantity: 0, reservedQuantity: 10 });

    // 10 concurrent requests trying to release 2 units each = 20 units release requested
    // Exactly 5 should succeed, 5 should fail with 409
    const concurrentReleases = Array.from({ length: 10 }, (_, index) =>
      request(app)
        .post(`/api/inventory/${testVariant.id}/release`)
        .send({
          quantity: 2,
          reason: `Concurrent release #${index + 1}`
        })
    );

    const responses = await Promise.all(concurrentReleases);

    const successful = responses.filter((r) => r.statusCode === 200);
    const conflicts = responses.filter((r) => r.statusCode === 409);

    expect(successful.length).toBe(5);
    expect(conflicts.length).toBe(5);

    const updatedVariant = await ProductVariant.findByPk(testVariant.id);
    expect(updatedVariant.availableQuantity).toBe(10);
    expect(updatedVariant.reservedQuantity).toBe(0);
    expect(updatedVariant.status).toBe(INVENTORY_STATUS.ACTIVE);
  });
});
