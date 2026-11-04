import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { PricingService, DEFAULT_PRICING_CONFIG } from './services/pricingService';
import { UpdatePricingSettingsSchema } from './models/validation';

// Firestore'a gitmeden varsayılan tarifeyle test edilir.
beforeEach(() => {
  PricingService.getPricingSettings = async () => ({ ...DEFAULT_PRICING_CONFIG });
});

const cityIn = (distanceKm: number, extra: { petWeightKg?: number; hasCompanion?: boolean } = {}) =>
  PricingService.calculatePrice({
    serviceType: 'CITY_IN',
    distanceKm,
    durationMinutes: 30,
    petWeightKg: extra.petWeightKg ?? 10,
    hasCompanion: extra.hasCompanion ?? false
  });

const cityOut = (distanceKm: number, petWeightKg: number, hasCompanion = false) =>
  PricingService.calculatePrice({
    serviceType: 'CITY_OUT',
    distanceKm,
    durationMinutes: 300,
    petWeightKg,
    hasCompanion
  });

describe('İzmir şehir içi: 10 km sabit taban', () => {
  test('9 km = 1.000 TL', async () => {
    assert.equal((await cityIn(9)).totalPrice, 1000);
  });

  test('10 km = 1.000 TL', async () => {
    assert.equal((await cityIn(10)).totalPrice, 1000);
  });

  test('11 km = 1.050 TL', async () => {
    assert.equal((await cityIn(11)).totalPrice, 1050);
  });

  test('15 km = 1.250 TL', async () => {
    assert.equal((await cityIn(15)).totalPrice, 1250);
  });

  test('10,5 km = 1.025 TL (kesirli km orantılı)', async () => {
    assert.equal((await cityIn(10.5)).totalPrice, 1025);
  });

  test('refakatçi ücretsiz, pet ağırlığı fiyatı etkilemez', async () => {
    const base = await cityIn(15);
    const withCompanion = await cityIn(15, { hasCompanion: true, petWeightKg: 60 });
    assert.equal(withCompanion.totalPrice, base.totalPrice);
    assert.equal(withCompanion.companionFee, 0);
    assert.equal(withCompanion.sizeMultiplier, 1);
  });

  test('admin dahil km ve ek km ücretini değiştirince hesap değişir', async () => {
    PricingService.getPricingSettings = async () => ({
      ...DEFAULT_PRICING_CONFIG,
      includedKmCityIn: 15,
      extraPerKmRateCityIn: 60
    });
    assert.equal((await cityIn(15)).totalPrice, 1000);
    assert.equal((await cityIn(16)).totalPrice, 1060);
  });
});

describe('Şehirlerarası', () => {
  test('480 km, küçük (4 kg) = 16.800 TL', async () => {
    assert.equal((await cityOut(480, 4)).totalPrice, 16800);
  });

  test('boyut çarpanı sınırları: 10 kg 1.0x, 11 kg 1.2x, 25 kg 1.2x, 26 kg 1.4x, 45 kg 1.4x, 46 kg 1.6x', async () => {
    const mult = async (kg: number) => (await cityOut(100, kg)).sizeMultiplier;
    assert.equal(await mult(10), 1.0);
    assert.equal(await mult(11), 1.2);
    assert.equal(await mult(25), 1.2);
    assert.equal(await mult(26), 1.4);
    assert.equal(await mult(45), 1.4);
    assert.equal(await mult(46), 1.6);
  });

  test('580 km, dev (50 kg), refakatçili = 34.220 TL', async () => {
    const p = await cityOut(580, 50, true);
    assert.equal(p.distanceFare, 32480);
    assert.equal(p.companionFee, 1740);
    assert.equal(p.totalPrice, 34220);
  });
});

describe('Admin fiyat ayarı şeması', () => {
  const valid = {
    baseFareCityIn: 1000,
    includedKmCityIn: 10,
    extraPerKmRateCityIn: 50,
    perKmRateCityOut: 35,
    companionRateCityOutPerKm: 3,
    sizeMultipliers: { SMALL: 1, MEDIUM: 1.2, LARGE: 1.4, GIANT: 1.6 },
    trafficFactorMultiplier: 1.15,
    enableTrafficFactor: false
  };

  test('dahil km ve ek km ücretini korur (eski alan olmadan)', () => {
    const parsed = UpdatePricingSettingsSchema.parse(valid);
    assert.equal(parsed.includedKmCityIn, 10);
    assert.equal(parsed.extraPerKmRateCityIn, 50);
  });

  test('negatif ek km ücretini reddeder', () => {
    assert.throws(() => UpdatePricingSettingsSchema.parse({ ...valid, extraPerKmRateCityIn: -1 }));
  });
});
