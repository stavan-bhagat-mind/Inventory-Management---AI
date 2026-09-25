const request = require('supertest');
const app = require('../src/app');
const { sequelize, Product, ProductVariant, InventoryHistory } = require('../src/models');
const { INVENTORY_STATUS, INVENTORY_ACTION } = require('../src/constants/inventory');

describe('Inventory Management API Integration Tests', () => {
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
    await InventoryHistory.destroy({ where: {}, truncate: true, cascade: true });
    await ProductVariant.destroy({ where: {}, truncate: true, cascade: true });
    await Product.destroy({ where: {}, truncate: true, cascade: true });

    testProduct = await Product.create({
      name: 'T-Shirt',
      description: 'Classic cotton t-shirt'
    });

    testVariant = await ProductVariant.create({
      productId: testProduct.id,
      sku: 'TSHIRT-RED-M',
      attributes: { size: 'Medium', color: 'Red' },
      price: 24.99,
      availableQuantity: 20,
      reservedQuantity: 5,
      reorderLevel: 10,
      status: INVENTORY_STATUS.ACTIVE
    });
  });

  describe('GET /api/inventory', () => {
    it('should retrieve inventory list with pagination metadata', async () => {
      const res = await request(app).get('/api/inventory?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].sku).toBe('TSHIRT-RED-M');
      expect(res.body.meta).toHaveProperty('totalItems', 1);
      expect(res.body.meta).toHaveProperty('totalPages', 1);
    });

    it('should search inventory by SKU', async () => {
      const res = await request(app).get('/api/inventory?search=RED-M');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].sku).toBe('TSHIRT-RED-M');
    });

    it('should search inventory by product name', async () => {
      const res = await request(app).get('/api/inventory?search=Shirt');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter inventory by status', async () => {
      const res = await request(app).get('/api/inventory?status=INACTIVE');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should filter low stock inventory', async () => {
      // testVariant has availableQuantity 20, reorderLevel 10 (not low stock)
      const res1 = await request(app).get('/api/inventory?lowStock=true');
      expect(res1.body.data.length).toBe(0);

      // Create a low stock variant
      await ProductVariant.create({
        productId: testProduct.id,
        sku: 'TSHIRT-BLU-S',
        attributes: { size: 'Small', color: 'Blue' },
        price: 19.99,
        availableQuantity: 5,
        reservedQuantity: 0,
        reorderLevel: 10,
        status: INVENTORY_STATUS.ACTIVE
      });

      const res2 = await request(app).get('/api/inventory?lowStock=true');
      expect(res2.body.data.length).toBe(1);
      expect(res2.body.data[0].sku).toBe('TSHIRT-BLU-S');
    });
  });

  describe('PATCH /api/inventory/:variantId', () => {
    it('should successfully update stock and record audit history', async () => {
      const res = await request(app)
        .patch(`/api/inventory/${testVariant.id}`)
        .send({
          availableQuantity: 35,
          price: 26.99,
          reason: 'Restock shipment received',
          referenceId: 'PO-9988'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.availableQuantity).toBe(35);
      expect(Number(res.body.data.price)).toBe(26.99);

      // Check history
      const history = await InventoryHistory.findOne({
        where: { variantId: testVariant.id, actionType: INVENTORY_ACTION.STOCK_UPDATE }
      });
      expect(history).not.toBeNull();
      expect(history.previousAvailable).toBe(20);
      expect(history.newAvailable).toBe(35);
      expect(history.quantityChange).toBe(15);
      expect(history.reason).toBe('Restock shipment received');
      expect(history.referenceId).toBe('PO-9988');
    });

    it('should reject negative available quantity with validation error', async () => {
      const res = await request(app)
        .patch(`/api/inventory/${testVariant.id}`)
        .send({ availableQuantity: -5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 400 for invalid UUID format', async () => {
      const res = await request(app)
        .patch('/api/inventory/invalid-uuid-format')
        .send({ availableQuantity: 10 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if variant does not exist', async () => {
      const nonExistentId = '11111111-1111-4111-8111-111111111111';
      const res = await request(app)
        .patch(`/api/inventory/${nonExistentId}`)
        .send({ availableQuantity: 10 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/inventory/:variantId/reserve', () => {
    it('should successfully reserve available inventory and record history', async () => {
      const res = await request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({
          quantity: 5,
          reason: 'Customer placed order',
          referenceId: 'ORD-1001'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.availableQuantity).toBe(15);
      expect(res.body.data.reservedQuantity).toBe(10);

      const history = await InventoryHistory.findOne({
        where: { variantId: testVariant.id, actionType: INVENTORY_ACTION.RESERVE }
      });
      expect(history).not.toBeNull();
      expect(history.previousAvailable).toBe(20);
      expect(history.newAvailable).toBe(15);
      expect(history.previousReserved).toBe(5);
      expect(history.newReserved).toBe(10);
      expect(history.quantityChange).toBe(-5);
      expect(history.referenceId).toBe('ORD-1001');
    });

    it('should reject reservation exceeding available inventory', async () => {
      const res = await request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({ quantity: 25 }); // only 20 available

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds available stock');

      // State remains unchanged
      const variant = await ProductVariant.findByPk(testVariant.id);
      expect(variant.availableQuantity).toBe(20);
      expect(variant.reservedQuantity).toBe(5);
    });

    it('should reject zero or negative reservation quantity', async () => {
      const res1 = await request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({ quantity: 0 });
      expect(res1.statusCode).toBe(400);

      const res2 = await request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({ quantity: -1 });
      expect(res2.statusCode).toBe(400);
    });
  });

  describe('POST /api/inventory/:variantId/release', () => {
    it('should successfully release reserved stock back to available pool', async () => {
      const res = await request(app)
        .post(`/api/inventory/${testVariant.id}/release`)
        .send({
          quantity: 3,
          reason: 'Order cancelled by customer',
          referenceId: 'ORD-1001'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.availableQuantity).toBe(23);
      expect(res.body.data.reservedQuantity).toBe(2);

      const history = await InventoryHistory.findOne({
        where: { variantId: testVariant.id, actionType: INVENTORY_ACTION.RELEASE }
      });
      expect(history).not.toBeNull();
      expect(history.previousAvailable).toBe(20);
      expect(history.newAvailable).toBe(23);
      expect(history.previousReserved).toBe(5);
      expect(history.newReserved).toBe(2);
      expect(history.quantityChange).toBe(3);
    });

    it('should reject release exceeding current reserved stock', async () => {
      const res = await request(app)
        .post(`/api/inventory/${testVariant.id}/release`)
        .send({ quantity: 10 }); // only 5 reserved

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds current reserved stock');

      const variant = await ProductVariant.findByPk(testVariant.id);
      expect(variant.availableQuantity).toBe(20);
      expect(variant.reservedQuantity).toBe(5);
    });

    it('should reject zero or negative release quantity', async () => {
      const res = await request(app)
        .post(`/api/inventory/${testVariant.id}/release`)
        .send({ quantity: 0 });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/inventory/:variantId/history', () => {
    it('should return chronological history records for a variant', async () => {
      // Perform two operations
      await request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({ quantity: 4, reason: 'Reservation 1' });

      await request(app)
        .post(`/api/inventory/${testVariant.id}/release`)
        .send({ quantity: 2, reason: 'Release 1' });

      const res = await request(app).get(`/api/inventory/${testVariant.id}/history`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.variant.id).toBe(testVariant.id);
      expect(res.body.data.histories.length).toBe(2);
      expect(res.body.data.histories[0].actionType).toBe(INVENTORY_ACTION.RELEASE);
      expect(res.body.data.histories[1].actionType).toBe(INVENTORY_ACTION.RESERVE);
      expect(res.body.meta.totalItems).toBe(2);
    });

    it('should filter history records by actionType', async () => {
      await request(app)
        .post(`/api/inventory/${testVariant.id}/reserve`)
        .send({ quantity: 4 });

      await request(app)
        .post(`/api/inventory/${testVariant.id}/release`)
        .send({ quantity: 2 });

      const res = await request(app).get(`/api/inventory/${testVariant.id}/history?actionType=RESERVE`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.histories.length).toBe(1);
      expect(res.body.data.histories[0].actionType).toBe(INVENTORY_ACTION.RESERVE);
    });
  });
});
