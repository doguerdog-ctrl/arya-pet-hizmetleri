import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { LocalFirestore } from './config/localFirestore';

describe('LocalFirestore (yerel mock veritabanı)', () => {
  let dir: string;
  let file: string;
  let db: LocalFirestore;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arya-localdb-'));
    file = path.join(dir, 'db.json');
    db = new LocalFirestore(file);
  });

  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  test('set/get: kayıt okunur, olmayan doküman exists=false', async () => {
    await db.collection('c').doc('a').set({ n: 1 });
    const hit = await db.collection('c').doc('a').get();
    assert.equal(hit.exists, true);
    assert.deepEqual(hit.data(), { n: 1 });
    assert.equal((await db.collection('c').doc('yok').get()).exists, false);
  });

  test('doc() kimliksiz çağrılınca benzersiz otomatik kimlik üretir', () => {
    const a = db.collection('c').doc();
    const b = db.collection('c').doc();
    assert.equal(a.id.length, 20);
    assert.notEqual(a.id, b.id);
  });

  test('update: alanları birleştirir, noktalı yolu iç içe yazar, olmayan dokümanda hata verir', async () => {
    const ref = db.collection('c').doc('a');
    await ref.set({ status: 'PENDING', info: { x: 1 } });
    await ref.update({ status: 'CONFIRMED', 'info.y': 2 });
    assert.deepEqual((await ref.get()).data(), { status: 'CONFIRMED', info: { x: 1, y: 2 } });
    await assert.rejects(db.collection('c').doc('yok').update({ a: 1 }), /No document to update/);
  });

  test('gerçek Firestore gibi undefined değerleri reddeder', async () => {
    await assert.rejects(
      db.collection('c').doc('a').set({ nested: { phone: undefined } }),
      /undefined.*nested\.phone/
    );
  });

  test('where("==") filtreler ve zincirlenir', async () => {
    await db.collection('c').doc('1').set({ userId: 'u1', status: 'PENDING' });
    await db.collection('c').doc('2').set({ userId: 'u1', status: 'COMPLETED' });
    await db.collection('c').doc('3').set({ userId: 'u2', status: 'PENDING' });
    const byUser = await db.collection('c').where('userId', '==', 'u1').get();
    assert.equal(byUser.docs.length, 2);
    const both = await db.collection('c').where('userId', '==', 'u1').where('status', '==', 'PENDING').get();
    assert.deepEqual(both.docs.map(d => d.id), ['1']);
    assert.throws(() => db.collection('c').where('userId', '>', 'u1'), /yalnızca '=='/);
  });

  test('okunan veri kopyadır: dışarıda değiştirmek depoyu bozmaz', async () => {
    const ref = db.collection('c').doc('a');
    await ref.set({ list: [1] });
    const copy = (await ref.get()).data() as { list: number[] };
    copy.list.push(2);
    assert.deepEqual((await ref.get()).data(), { list: [1] });
  });

  test('veriler dosyaya yazılır ve yeni örnek tarafından geri okunur', async () => {
    await db.collection('c').doc('a').set({ n: 42 });
    const reopened = new LocalFirestore(file);
    assert.deepEqual((await reopened.collection('c').doc('a').get()).data(), { n: 42 });
  });
});
