# Arya Pet Nakil - Proje ve Mimari Rehberi (Claude Code Context)

İzmir merkezli profesyonel evcil hayvan transferi projesi (Arya Pet Nakil).

## 🚀 Temel İş Modeli & Fiyatlandırma Kuralları
1. **İzmir Şehir İçi Transfer (Üs Noktası):**
   - **0 – 10 km:** Sabit **1.000 TL** (Ekstra km ücreti yok).
   - **11. km ve sonrası:** Sabit 1.000 TL + `(Mesafe - 10) * 50 TL/km`.
   - **Refakatçi (Pet Sahibi):** Şehir içinde **ÜCRETSİZDİR (0 TL)**.
   - **Pet Boyutu/Ağırlığı:** Şehir içi fiyata etki etmez.
   - Bu ayarlar Admin panelinden dinamik değiştirilebilir.

2. **Şehirlerarası Transfer:**
   - Formül: `(Mesafe KM * Şehirlerarası KM Ücreti [35 TL] * Boyut Çarpanı) + Refakatçi Ücreti`
   - **Boyut Çarpanları:**
     - Küçük (0 - 10 kg): `1.0x`
     - Orta (11 - 25 kg): `1.2x`
     - Büyük (26 - 45 kg): `1.4x`
     - Dev (45+ kg): `1.6x`
   - **Refakatçi:** Şehirlerarasında KM başına ek ücretlidir (`3 TL/km`).

3. **Operasyon & Filo:**
   - Şu an **TEK ÖZEL ARAÇ** (Plaka: `35 ARY 01`, sterilize kabin, klima) ve **TEK ŞOFÖR** bulunmaktadır.
   - Çoklu filo karmaşasından kaçınılmıştır.

4. **Canlı Takip Mekanizması:**
   - Kamera sistemi yoktur.
   - Şoförün aracından WhatsApp üzerinden başlattığı **Canlı Konum Linki**, rezervasyonla eşleşir ve müşteri mobil uygulamadaki tek tık butonla canlı konumu izler.

5. **Pet Konforu & Takvim:**
   - Şirketin steril taşıma box'ı veya sahibinin kendi box'ı seçilebilir.
   - İklimlendirme modu (Klima serin 21°C / Normal 24°C / Ilık).
   - Beslenme ve tuvalet mola takvimi (1.5 - 2 saatte bir).

---

## 📁 Proje Dizin Yapısı
- `backend/`: TypeScript, Express, Firebase Firestore, Google Maps Distance Matrix servisi, Zod şemaları ve dinamik `pricingService.ts`.
- `mobile/`: Flutter tabanlı Android/iOS müşteri uygulaması (`mobile-preview.html` ile anlık tarayıcı simülasyonu mevcuttur).
- `admin-dashboard/`: Tek araç operasyon masası, 1.000 TL ve 50 TL/km tarife güncelleme, WhatsApp canlı konum eşleme paneli (`index.html`).

## 🛠️ Claude Code ile Başlangıç Komutları
- Proje dizinine git: `cd /Users/dogukanerdogan/.gemini/antigravity/scratch/arya-pet-nakil`
- Claude Code başlat: `claude`
