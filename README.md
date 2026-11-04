# 🐾 Arya Pet Nakil - Tam Teşekküllü Pet Taşımacılığı Sistemi

Arya Pet Nakil için geliştirilen; Backend API servisi, Android Flutter mobil uygulaması ve Web Admin yönetim panelinden oluşan ana platform.

---

## 🏗️ Mimari Bileşenler

| Modül | Dizin | Açıklama |
|---|---|---|
| **Backend Servisi** | [`backend/`](./backend/) | TypeScript, Express, Firebase Firestore & Google Maps API tabanlı dinamik fiyat motoru ve rezervasyon yönetimi. |
| **Android Mobil Uygulama** | [`mobile/`](./mobile/) | Flutter ile geliştirilmiş müşteri rezervasyon, pati profili (aşı/çip/sağlık) ve WhatsApp canlı takip ekranları. Tarayıcıda simülasyon: `mobile/mobile-preview.html`. |
| **Web Admin Paneli** | [`admin-dashboard/`](./admin-dashboard/) | Taban ücret, dahil km sınırı ve ek km ücretini yöneten; rezervasyonları listeleyen ve WhatsApp konum linki bağlayan tek sayfa panel (backend API'ye bağlı). |

---

## 🎯 Temel İş Kuralları
1. **İzmir İçi Transfer:**
   - **0 – 10 km:** sabit **1.000 TL** (ekstra km ücreti yok).
   - **11. km ve sonrası:** `1.000 TL + (Mesafe - 10) × 50 TL/km` (örn. 11 km = 1.050 TL, 15 km = 1.250 TL).
   - 1.000 TL taban, 10 km dahil sınırı ve 50 TL/km ek ücret Admin panelden dinamik düzenlenebilir.
   - Refakatçi (pet sahibi) araçta ücretsizdir (0 TL).
   - Pet boyutu/ağırlığı fiyata etki etmez.
2. **Şehirlerarası Transfer:**
   - Formül: `(Mesafe KM × 35 TL × Boyut Çarpanı) + Refakatçi Ücreti`
   - Boyut çarpanları: Küçük (0-10 kg) 1.0x, Orta (11-25 kg) 1.2x, Büyük (26-45 kg) 1.4x, Dev (45+ kg) 1.6x.
   - Refakatçi KM başına 3 TL ek ücrete tabidir.
3. **Filo & Operasyon:**
   - Tek özel araç (Plaka: **35 ARY 01**, sterilize kabin, klima kontrollü) ve tek şoför.
4. **Canlı Takip:**
   - Kamera yayını yoktur. Şoförün araçtan açtığı WhatsApp Canlı Konum linki rezervasyona bağlanır; müşteri mobil uygulamada tek dokunuşla canlı konuma erişir.
5. **Konfor & Sağlık:**
   - Sterilize edilmiş özel şirket kafesi veya sahibinin kendi kafesi.
   - İklimlendirme modu (klima serin / normal / ılık).
   - Zaman çizelgeli beslenme ve tuvalet mola takvimi.

---

## 🚀 Hızlı Başlangıç
```bash
# Backend (Node.js gerekir)
cd backend
npm install
npm test            # fiyat motoru testleri
npm run simulate    # örnek fiyat senaryoları
npm run seed:local  # (isteğe bağlı) örnek rezervasyonlar
npm run dev         # API: http://localhost:4000

# Admin paneli: backend çalışırken tarayıcıda açın
open admin-dashboard/index.html
```
Firebase kimliği (`FIREBASE_SERVICE_ACCOUNT_KEY`) tanımlı değilse backend otomatik olarak yerel mock veritabanını (`backend/.local-db.json`) kullanır; böylece rezervasyon listeleme, durum güncelleme, fiyat kaydetme ve WhatsApp eşleme canlı Firebase olmadan uçtan uca denenebilir. Gerçek Firestore için `backend/.env.example` dosyasına bakın.
