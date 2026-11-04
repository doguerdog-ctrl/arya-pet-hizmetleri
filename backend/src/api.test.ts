import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { AddressInfo } from 'net';
import type { Server } from 'http';

// Gerçek API'yi yerel mock veritabanıyla (geçici dosya) ayağa kaldırıp HTTP üzerinden test eder.
describe('API uçtan uca (yerel mock veritabanı)', () => {
  let server: Server;
  let base: string;
  let tmpDir: string;
  let dbFile: string;
  let bookingId: string;

  const call = async (method: string, route: string, body?: unknown) => {
    const res = await fetch(base + route, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: res.status, body: (await res.json()) as any };
  };

  const bookingPayload = () => ({
    userId: 'u1',
    customerName: 'Selin Yılmaz',
    customerPhone: '+905321112233',
    pet: { userId: 'u1', name: 'Luna', type: 'DOG', weightKg: 24, sizeCategory: 'MEDIUM', cagePreference: 'COMPANY_PROVIDES' },
    serviceType: 'CITY_IN',
    origin: { address: 'Karşıyaka Çarşı, İzmir', latitude: 38.4595, longitude: 27.11 },
    destination: { address: 'Alsancak Kordon, İzmir', latitude: 38.435, longitude: 27.145 },
    pickupDateTime: '2026-11-10T09:00:00.000Z',
    hasCompanion: true
  });

  before(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arya-api-'));
    dbFile = path.join(tmpDir, 'db.json');
    process.env.USE_LOCAL_DB = 'true';
    process.env.LOCAL_DB_FILE = dbFile;
    process.env.NODE_ENV = 'test';
    process.env.GOOGLE_MAPS_API_KEY = ''; // Maps'e gitme, Haversine yedeğini kullan
    const { default: app } = await import('./index');
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  });

  after(() => {
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('başlangıçta rezervasyon listesi boş', async () => {
    const r = await call('GET', '/bookings');
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.data, []);
  });

  test('rezervasyon oluşturulur (PENDING, İzmir içi 10 km altı = 1.000 TL) ve listelenir', async () => {
    const created = await call('POST', '/bookings', bookingPayload());
    assert.equal(created.status, 201);
    assert.equal(created.body.data.status, 'PENDING');
    assert.equal(created.body.data.pricing.totalPrice, 1000);
    bookingId = created.body.data.id;

    const list = await call('GET', '/bookings');
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].id, bookingId);
  });

  test('geçersiz rezervasyon 400 döner', async () => {
    const r = await call('POST', '/bookings', { ...bookingPayload(), customerPhone: '123' });
    assert.equal(r.status, 400);
  });

  test('PATCH status: izin verilen tüm durumlar kaydedilir ve listede görünür', async () => {
    for (const status of ['CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'PENDING']) {
      const r = await call('PATCH', `/bookings/${bookingId}/status`, { status });
      assert.equal(r.status, 200, status);
      assert.deepEqual(r.body.data, { id: bookingId, status });
      const list = await call('GET', '/bookings?status=' + status);
      assert.equal(list.body.data[0].status, status);
    }
  });

  test('PATCH status: geçersiz durum 400, olmayan rezervasyon 404', async () => {
    assert.equal((await call('PATCH', `/bookings/${bookingId}/status`, { status: 'FLYING' })).status, 400);
    assert.equal((await call('PATCH', `/bookings/${bookingId}/status`, {})).status, 400);
    assert.equal((await call('PATCH', '/bookings/yok123/status', { status: 'CONFIRMED' })).status, 404);
  });

  test('WhatsApp linki sürücü telefonu olmadan bağlanır ve listede görünür', async () => {
    const url = 'https://wa.me/905550000000?text=CanliKonum';
    const r = await call('POST', `/bookings/${bookingId}/whatsapp-tracking`, { liveLocationUrl: url });
    assert.equal(r.status, 200);
    const list = await call('GET', '/bookings');
    assert.equal(list.body.data[0].whatsappTracking.liveLocationUrl, url);
  });

  test('WhatsApp: eksik/güvensiz link 400, olmayan rezervasyon 404', async () => {
    const route = `/bookings/${bookingId}/whatsapp-tracking`;
    assert.equal((await call('POST', route, {})).status, 400);
    assert.equal((await call('POST', route, { liveLocationUrl: 'javascript:alert(1)' })).status, 400);
    assert.equal((await call('POST', route, { liveLocationUrl: 'not a url' })).status, 400);
    const missing = await call('POST', '/bookings/yok123/whatsapp-tracking', { liveLocationUrl: 'https://wa.me/1' });
    assert.equal(missing.status, 404);
  });

  test('fiyat ayarı kaydedilir, okunur ve yeniden başlatmada dosyadan gelir', async () => {
    const current = (await call('GET', '/admin/pricing')).body.data;
    const body = {
      baseFareCityIn: 1200,
      includedKmCityIn: 12,
      extraPerKmRateCityIn: 60,
      perKmRateCityOut: current.perKmRateCityOut,
      companionRateCityOutPerKm: current.companionRateCityOutPerKm,
      sizeMultipliers: current.sizeMultipliers,
      trafficFactorMultiplier: current.trafficFactorMultiplier,
      enableTrafficFactor: current.enableTrafficFactor
    };
    const put = await call('PUT', '/admin/pricing', body);
    assert.equal(put.status, 200);

    const got = (await call('GET', '/admin/pricing')).body.data;
    assert.equal(got.baseFareCityIn, 1200);
    assert.equal(got.includedKmCityIn, 12);
    assert.equal(got.extraPerKmRateCityIn, 60);

    const onDisk = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    assert.equal(onDisk.system_settings.current_pricing.extraPerKmRateCityIn, 60);
    assert.ok(Object.keys(onDisk.bookings).length >= 1);
  });
});
