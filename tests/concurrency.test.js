const http = require('http');
const app = require('../src/app');
const { sequelize, ProductVariant } = require('../src/models');

const PORT = 5055;

function makeRequest({ path, method, body }) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        }
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: JSON.parse(responseBody)
            });
          } catch {
            resolve({
              statusCode: res.statusCode,
              raw: responseBody
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runConcurrencyTest() {
  console.log('=== Starting Concurrency & Business Rules Test ===');

  let server;
  try {
    await sequelize.authenticate();
    console.log('[Test Setup] Database connected.');

    server = app.listen(PORT);
    await new Promise((resolve) => server.on('listening', resolve));
    console.log(`[Test Setup] Test server listening on port ${PORT}.`);

    // Pick or create a test variant
    const variantId = '22222222-2222-2222-2222-222222222204'; // TSHIRT-BLUE-S
    const initialVariant = await ProductVariant.findByPk(variantId);

    if (!initialVariant) {
      throw new Error(`Variant ${variantId} not found. Run db:seed first.`);
    }

    console.log(`[Initial State] SKU: ${initialVariant.sku}, Available: ${initialVariant.availableQuantity}, Reserved: ${initialVariant.reservedQuantity}`);

    // Set available stock to exactly 5 for testing
    await makeRequest({
      path: `/api/inventory/${variantId}`,
      method: 'PATCH',
      body: { available_quantity: 5 }
    });

    console.log('[Test 1] Firing 10 concurrent requests to reserve 1 unit each (Available: 5)...');
    const reservePromises = Array.from({ length: 10 }, (_, i) =>
      makeRequest({
        path: `/api/inventory/${variantId}/reserve`,
        method: 'POST',
        body: { quantity: 1, reason: `Concurrent test reservation #${i + 1}`, reference_id: `CONC-${i + 1}` }
      })
    );

    const results = await Promise.all(reservePromises);
    const successCount = results.filter((r) => r.statusCode === 200).length;
    const failedCount = results.filter((r) => r.statusCode === 400).length;

    console.log(`[Test 1 Results] Success (200): ${successCount}, Rejected (400): ${failedCount}`);

    if (successCount !== 5 || failedCount !== 5) {
      throw new Error(`Concurrency race condition detected! Expected 5 successes and 5 failures, got ${successCount} successes.`);
    }

    const stateAfterReserve = await ProductVariant.findByPk(variantId);
    console.log(`[State After Reserve] Available: ${stateAfterReserve.availableQuantity}, Reserved: ${stateAfterReserve.reservedQuantity}`);

    if (stateAfterReserve.availableQuantity !== 0) {
      throw new Error(`Expected available quantity 0, got ${stateAfterReserve.availableQuantity}`);
    }

    // Test 2: Cannot release more than reserved
    console.log('[Test 2] Testing over-release prevention rule...');
    const invalidRelease = await makeRequest({
      path: `/api/inventory/${variantId}/release`,
      method: 'POST',
      body: { quantity: 999, reason: 'Illegal over-release test' }
    });

    if (invalidRelease.statusCode !== 400) {
      throw new Error(`Expected 400 for over-releasing, got ${invalidRelease.statusCode}`);
    }
    console.log('[Test 2 Results] Over-release correctly rejected with HTTP 400.');

    // Test 3: Release all reserved stock
    console.log('[Test 3] Releasing 5 reserved units back to available...');
    const releaseRes = await makeRequest({
      path: `/api/inventory/${variantId}/release`,
      method: 'POST',
      body: { quantity: 5, reason: 'Valid release test' }
    });

    if (releaseRes.statusCode !== 200) {
      throw new Error(`Release failed with ${releaseRes.statusCode}`);
    }

    const finalState = await ProductVariant.findByPk(variantId);
    console.log(`[Final State] Available: ${finalState.availableQuantity}, Reserved: ${finalState.reservedQuantity}`);

    if (finalState.availableQuantity !== 5) {
      throw new Error(`Expected available quantity 5, got ${finalState.availableQuantity}`);
    }

    // Verify history audit logs
    const historyRes = await makeRequest({
      path: `/api/inventory/${variantId}/history`,
      method: 'GET'
    });

    console.log(`[Audit Logs] Verified ${historyRes.body.data.length} history records created.`);

    console.log('\n>>> ALL CONCURRENCY AND BUSINESS RULES TESTS PASSED! <<<');
  } catch (error) {
    console.error('\n[Test Failure]', error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await sequelize.close();
  }
}

if (require.main === module) {
  runConcurrencyTest();
}

module.exports = runConcurrencyTest;
