# Arya Pet Nakil - Backend ve Veri Modeli Mimarisi

İzmir merkezli profesyonel evcil hayvan transferi (Arya Pet Nakil) için geliştirilmiş backend servisi, Firestore modelleri ve dinamik fiyat hesaplama motoru.

## 📁 Proje Dizin Yapısı
```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts           # Firebase Admin SDK & Firestore koleksiyonları (kimlik yoksa yerel mock)
│   │   └── localFirestore.ts     # Firebase'siz geliştirme için JSON dosyalı Firestore taklidi
│   ├── models/
│   │   └── validation.ts         # Zod doğrulama şemaları (Rezervasyon, Pet, Admin ayarları)
│   ├── routes/
│   │   └── api.ts                # Express REST API uç noktaları
│   ├── services/
│   │   ├── bookingService.ts     # Rezervasyon, atama ve WhatsApp takip entegrasyonu
│   │   ├── mapService.ts         # Google Maps mesafe & anlık trafik analizi
│   │   └── pricingService.ts     # Dinamik fiyatlandırma motoru (10 km sabit 1000 TL, sonrası 50 TL/km, KM çarpanları)
│   ├── types/
│   │   └── index.ts              # TypeScript veri modelleri ve tipler
│   ├── index.ts                  # Express sunucusu
│   ├── pricing.test.ts           # Fiyat motoru birim testleri (9/10/11 km sınırı dahil)
│   ├── local-db.test.ts          # Yerel mock veritabanı testleri
│   ├── api.test.ts               # API uçtan uca testleri (yerel mock ile)
│   ├── seed-local.ts             # Yerel mock için örnek rezervasyonlar
│   └── test-simulation.ts        # Fiyat senaryoları simülasyonu
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🐾 Fiyatlandırma Motoru Kuralları

### 1. İzmir Şehir İçi Transfer
- **0 – 10 km:** Sabit `1.000 TL` (`baseFareCityIn`, `includedKmCityIn`).
- **11. km ve sonrası:** `1.000 TL + (Mesafe - 10) * 50 TL` (`extraPerKmRateCityIn`). Örn. 11 km = 1.050 TL.
- Taban ücret, dahil km sınırı ve ek km ücreti `PUT /api/admin/pricing` ile dinamik güncellenir.
- **Refakatçi:** Ücretsiz (+0 TL).
- **Pet Boyutu:** Şehir içi taşımalarda fiyata etki etmez.

### 2. Şehirlerarası Transfer
- **Ücret Hesabı:** `(Mesafe KM * Şehirlerarası KM Ücreti * Pet Boyut Çarpanı) + Refakatçi Ücreti`
- **Pet Boyut Çarpanları:**
  - Küçük (0 - 10 kg): `1.0x`
  - Orta (11 - 25 kg): `1.2x`
  - Büyük (26 - 45 kg): `1.4x`
  - Dev (45+ kg): `1.6x`
- **Refakatçi:** KM başına ek tutar (`companionRateCityOutPerKm * KM`).

---

## 🧪 Çalıştırma ve Test
```bash
npm install
npm test            # fiyat motoru, yerel veritabanı ve API uçtan uca testleri (Firebase gerekmez)
npm run simulate    # örnek fiyat senaryoları
npm run seed:local  # yerel mock veritabanına 3 örnek rezervasyon ekler
npm run dev         # API: http://localhost:4000
```

### 🗄️ Yerel Mock Veritabanı (Firebase kimliği olmadan)
`FIREBASE_SERVICE_ACCOUNT_KEY` (veya `FIRESTORE_EMULATOR_HOST`) tanımlı değilse backend otomatik olarak yerel moda geçer: veriler bellekte tutulur ve `backend/.local-db.json` dosyasına yazılır, yeniden başlatmada geri yüklenir. Dosyayı silmek veritabanını sıfırlar.
- `USE_LOCAL_DB=true` yerel modu zorlar, `USE_LOCAL_DB=false` gerçek Firestore'u zorlar. `LOCAL_DB_FILE` dosya yolunu değiştirir.
- Mock, Firestore'un kullandığımız alt kümesini taklit eder (`doc().get/set/update`, `where('==')`) ve gerçeği gibi `undefined` değerleri reddeder. Ayrıntılar: `src/config/localFirestore.ts`.
- Uçtan uca deneme: `npm run seed:local && npm run dev`, sonra `../admin-dashboard/index.html` dosyasını açın.

## 🔌 API Uç Noktaları
| Yöntem | Yol | Açıklama |
|---|---|---|
| POST | `/api/pricing/estimate` | Rota ve fiyat tahmini |
| POST | `/api/bookings` | Rezervasyon oluştur |
| GET | `/api/bookings` | Rezervasyonları listele (`userId`, `status` filtreleri) |
| PATCH | `/api/bookings/:id/status` | Durumu güncelle: `PENDING`, `CONFIRMED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED` (geçersiz değer 400, kayıt yoksa 404) |
| POST | `/api/bookings/:id/whatsapp-tracking` | WhatsApp canlı konum linkini bağla (yalnızca http(s) linki; kayıt yoksa 404) |
| GET / PUT | `/api/admin/pricing` | Fiyat ayarlarını oku / güncelle |

Not: Admin uç noktalarında henüz kimlik doğrulama yoktur; canlıya almadan önce eklenmelidir.

---

## 📍 WhatsApp Canlı Takip Entegrasyonu
Müşterinin transfer sırasında evcil hayvanını izleyebilmesi için sürücünün aracı üzerinden paylaştığı **WhatsApp Canlı Konum linki**, `/api/bookings/:id/whatsapp-tracking` servisi ile rezervasyona bağlanır. Müşteri mobil uygulamasındaki "WhatsApp ile Canlı Takip Et" butonuna bastığında doğrudan WhatsApp konum oturumuna yönlendirilir.
