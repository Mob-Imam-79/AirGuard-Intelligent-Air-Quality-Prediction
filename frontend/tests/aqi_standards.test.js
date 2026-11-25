import test from 'node:test';
import assert from 'node:assert/strict';
import { AQI_CATEGORIES, getCategoryInfo } from '../src/utils/aqiStandards.js';

test('AQI_CATEGORIES contains all 6 CPCB standard categories', () => {
  const expectedCategories = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];
  for (const cat of expectedCategories) {
    assert.ok(AQI_CATEGORIES[cat], `Missing category: ${cat}`);
    assert.ok(AQI_CATEGORIES[cat].color, `Missing color for: ${cat}`);
    assert.ok(AQI_CATEGORIES[cat].range, `Missing range for: ${cat}`);
    assert.ok(AQI_CATEGORIES[cat].description, `Missing description for: ${cat}`);
  }
});

test('getCategoryInfo returns exact category configuration', () => {
  const goodInfo = getCategoryInfo('Good');
  assert.strictEqual(goodInfo.name, 'Good');
  assert.strictEqual(goodInfo.color, '#16A34A');

  const severeInfo = getCategoryInfo('Severe');
  assert.strictEqual(severeInfo.name, 'Severe');
  assert.strictEqual(severeInfo.color, '#7F1D1D');
});

test('getCategoryInfo falls back safely to Moderate for unknown category', () => {
  const fallback = getCategoryInfo('UnknownCategory');
  assert.strictEqual(fallback.name, 'Moderate');
  assert.strictEqual(fallback.color, '#EAB308');
});

test('Category colors match standard health warning codes', () => {
  assert.strictEqual(AQI_CATEGORIES['Good'].color, '#16A34A');
  assert.strictEqual(AQI_CATEGORIES['Satisfactory'].color, '#84CC16');
  assert.strictEqual(AQI_CATEGORIES['Moderate'].color, '#EAB308');
  assert.strictEqual(AQI_CATEGORIES['Poor'].color, '#F97316');
  assert.strictEqual(AQI_CATEGORIES['Very Poor'].color, '#DC2626');
  assert.strictEqual(AQI_CATEGORIES['Severe'].color, '#7F1D1D');
});
