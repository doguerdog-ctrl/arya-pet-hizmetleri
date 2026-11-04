import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

/**
 * Firebase kimliği olmadan yerel geliştirme için Firestore'un küçük bir alt kümesini taklit eder.
 * Veriler bellekte tutulur ve her yazmada bir JSON dosyasına kaydedilir.
 *
 * Desteklenen: collection().doc(id?).get/set/update, collection().where(alan, '==', değer).get()
 * Gerçek Firestore gibi `undefined` değerleri reddeder; böylece hatalar yerelde de yakalanır.
 */

type DocData = Record<string, unknown>;

function assertNoUndefined(value: unknown, fieldPath: string): void {
  if (value === undefined) {
    throw new Error(`Cannot use "undefined" as a Firestore value (found in field "${fieldPath}").`);
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoUndefined(item, `${fieldPath}[${i}]`));
  } else if (value && typeof value === 'object' && !(value instanceof Date)) {
    for (const [key, v] of Object.entries(value)) {
      assertNoUndefined(v, fieldPath ? `${fieldPath}.${key}` : key);
    }
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function getPath(data: DocData, fieldPath: string): unknown {
  return fieldPath.split('.').reduce<unknown>((acc, key) => {
    return acc && typeof acc === 'object' ? (acc as DocData)[key] : undefined;
  }, data);
}

function setPath(data: DocData, fieldPath: string, value: unknown): void {
  const keys = fieldPath.split('.');
  let target = data;
  for (const key of keys.slice(0, -1)) {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
    target = target[key] as DocData;
  }
  target[keys[keys.length - 1]] = value;
}

export class LocalFirestore {
  private tables: Record<string, Record<string, DocData>> = {};

  constructor(private readonly filePath: string) {
    try {
      this.tables = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        console.warn(`Yerel veritabanı dosyası okunamadı (${filePath}), boş başlatılıyor:`, e.message);
      }
    }
  }

  public collection(name: string): LocalCollection {
    return new LocalCollection(this, name);
  }

  /** @internal */
  public table(name: string): Record<string, DocData> {
    if (!this.tables[name]) this.tables[name] = {};
    return this.tables[name];
  }

  /** @internal */
  public persist(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.tables, null, 2));
    fs.renameSync(tmp, this.filePath);
  }
}

export class LocalDocSnapshot {
  constructor(public readonly id: string, private readonly raw: DocData | undefined) {}

  public get exists(): boolean {
    return this.raw !== undefined;
  }

  public data(): DocData | undefined {
    return this.raw === undefined ? undefined : clone(this.raw);
  }
}

export class LocalDocRef {
  constructor(
    private readonly db: LocalFirestore,
    private readonly collectionName: string,
    public readonly id: string
  ) {}

  public async get(): Promise<LocalDocSnapshot> {
    return new LocalDocSnapshot(this.id, this.db.table(this.collectionName)[this.id]);
  }

  public async set(data: DocData): Promise<void> {
    assertNoUndefined(data, '');
    this.db.table(this.collectionName)[this.id] = clone(data);
    this.db.persist();
  }

  public async update(data: DocData): Promise<void> {
    assertNoUndefined(data, '');
    const existing = this.db.table(this.collectionName)[this.id];
    if (!existing) {
      throw new Error(`No document to update: ${this.collectionName}/${this.id}`);
    }
    for (const [key, value] of Object.entries(clone(data))) {
      setPath(existing, key, value);
    }
    this.db.persist();
  }
}

export class LocalQuery {
  constructor(
    protected readonly db: LocalFirestore,
    protected readonly collectionName: string,
    private readonly filters: Array<{ field: string; value: unknown }> = []
  ) {}

  public where(field: string, op: string, value: unknown): LocalQuery {
    if (op !== '==') {
      throw new Error(`Yerel veritabanı yalnızca '==' sorgusunu destekler (gelen: '${op}').`);
    }
    return new LocalQuery(this.db, this.collectionName, [...this.filters, { field, value }]);
  }

  public async get(): Promise<{ docs: LocalDocSnapshot[] }> {
    const table = this.db.table(this.collectionName);
    const docs = Object.entries(table)
      .filter(([, data]) => this.filters.every(f => getPath(data, f.field) === f.value))
      .map(([id, data]) => new LocalDocSnapshot(id, data));
    return { docs };
  }
}

export class LocalCollection extends LocalQuery {
  constructor(db: LocalFirestore, name: string) {
    super(db, name);
  }

  public doc(id?: string): LocalDocRef {
    return new LocalDocRef(this.db, this.collectionName, id ?? randomUUID().replace(/-/g, '').slice(0, 20));
  }
}
