/**
 * Test Script: Request Deduplication
 *
 * Simulates concurrent requests to verify deduplication is working.
 *
 * Usage:
 *   npx tsx scripts/test-deduplication.ts
 */

import { deduplicator } from '../src/lib/api-football/deduplicator';

// Simulate a slow API call
async function slowApiCall(id: number): Promise<string> {
  console.log(`  🌐 API Call initiated for ID: ${id}`);
  await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
  console.log(`  ✅ API Call completed for ID: ${id}`);
  return `Data for ${id}`;
}

async function testDeduplication() {
  console.log('🧪 Testing Request Deduplication\n');
  console.log('='.repeat(60));

  // Test 1: Sequential requests (no dedup expected)
  console.log('\n📌 Test 1: Sequential Requests (2 API calls expected)');
  console.log('-'.repeat(60));

  const seq1 = await deduplicator.dedupe('test-1', () => slowApiCall(1));
  console.log(`Result: ${seq1}`);

  const seq2 = await deduplicator.dedupe('test-1', () => slowApiCall(1));
  console.log(`Result: ${seq2}`);

  // Test 2: Concurrent requests (dedup expected)
  console.log('\n📌 Test 2: Concurrent Requests (1 API call expected)');
  console.log('-'.repeat(60));

  const promises = Array.from({ length: 10 }, (_, i) =>
    deduplicator.dedupe('test-2', () => slowApiCall(2))
  );

  console.log('  ⏳ Sending 10 concurrent requests...');
  const results = await Promise.all(promises);
  console.log(`  ✅ All 10 requests completed`);
  console.log(`  📊 Unique results: ${new Set(results).size}`);

  // Test 3: Different keys (no dedup expected)
  console.log('\n📌 Test 3: Different Keys (3 API calls expected)');
  console.log('-'.repeat(60));

  const diff = await Promise.all([
    deduplicator.dedupe('test-3a', () => slowApiCall(3)),
    deduplicator.dedupe('test-3b', () => slowApiCall(4)),
    deduplicator.dedupe('test-3c', () => slowApiCall(5)),
  ]);
  console.log(`  ✅ Results: ${diff.join(', ')}`);

  // Test 4: Mixed concurrent (partial dedup)
  console.log('\n📌 Test 4: Mixed Concurrent (2 API calls expected)');
  console.log('-'.repeat(60));

  const mixed = await Promise.all([
    deduplicator.dedupe('test-4a', () => slowApiCall(6)),
    deduplicator.dedupe('test-4a', () => slowApiCall(6)),
    deduplicator.dedupe('test-4a', () => slowApiCall(6)),
    deduplicator.dedupe('test-4b', () => slowApiCall(7)),
    deduplicator.dedupe('test-4b', () => slowApiCall(7)),
  ]);
  console.log(`  ✅ Results: ${mixed.join(', ')}`);

  // Print stats
  console.log('\n📊 Deduplicator Stats');
  console.log('-'.repeat(60));
  console.log(deduplicator.getStats());

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed successfully!');
  console.log('='.repeat(60) + '\n');
}

// Run tests
await testDeduplication();
