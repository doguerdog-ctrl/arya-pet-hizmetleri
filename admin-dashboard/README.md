# Arya Pet Nakil - Web Admin Yönetim Paneli

Arya Pet Nakil operasyon amiri için tek araç (35 ARY 01) operasyon masası. Panel backend API'ye bağlıdır; örnek veri göstermez.

## 🚀 Yetenekler
1. **Fiyat Parametreleri** (`GET` / `PUT /api/admin/pricing`):
   - Sabit taban ücret (varsayılan 1.000 TL), taban ücrete dahil km (10 km), dahil km sonrası km başı ücret (50 TL) ve şehirlerarası km başı ücret.
   - Kaydedilmeyen diğer ayarlar (refakatçi ücreti, boyut çarpanları) olduğu gibi korunur.
2. **Rezervasyon Listesi** (`GET /api/bookings`):
   - Kod, müşteri & pet, güzergah, hesap kuralı, tutar, durum ve canlı konum durumu.
   - **Durum yönetimi** (`PATCH /api/bookings/:id/status`): Durum sütunundaki seçiciyle herhangi bir duruma (Onay Bekliyor, Onaylandı, Yolda, Tamamlandı, İptal) geçilir; "Onayla → Yola Çıkar → Tamamla" butonu bir sonraki adıma tek tıkla ilerletir.
3. **WhatsApp Canlı Konum Eşleme** (`POST /api/bookings/:id/whatsapp-tracking`):
   - Şoförün paylaştığı linki rezervasyona bağlar; müşteri mobil uygulamadan tek dokunuşla izler. Yalnızca http(s) linkleri kabul edilir.

## 💻 Nasıl Çalıştırılır?
1. Backend'i başlatın (`cd ../backend && npm run seed:local && npm run dev`, varsayılan `http://localhost:4000`). Firebase kimliği yoksa backend yerel mock veritabanını kullanır, `seed:local` örnek rezervasyonları ekler.
2. `index.html` dosyasını tarayıcıda açın:
```bash
open index.html
```
Backend başka bir adreste ise: `index.html?api=https://alanadi/api`

Not: Bağlantı veya sunucu hatası olursa panel sayfanın üstünde / tabloda hata mesajı gösterir.
