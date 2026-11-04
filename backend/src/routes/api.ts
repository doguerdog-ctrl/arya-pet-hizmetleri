import { Router, Request, Response } from 'express';
import { PricingService } from '../services/pricingService';
import { BookingService } from '../services/bookingService';
import { MapService } from '../services/mapService';
import { CreateBookingSchema, UpdatePricingSettingsSchema } from '../models/validation';
import { db, COLLECTIONS } from '../config/firebase';

export const apiRouter = Router();

/**
 * 1. Anlık Fiyat & Çoklu Durak Rota Teklifi (Google Maps Canlı Veri)
 */
apiRouter.post('/pricing/estimate', async (req: Request, res: Response) => {
  try {
    const { origin, destination, stops = [], serviceType, petWeightKg, hasCompanion } = req.body;

    if (!origin || !destination || !serviceType || petWeightKg === undefined) {
      return res.status(400).json({ error: 'Eksik parametreler (origin, destination, serviceType, petWeightKg zorunludur).' });
    }

    // Google Maps üzerinden ara duraklar dahil canlı mesafe ve süre hesabı
    const route = await MapService.calculateMultiStopRoute(origin, destination, stops);

    // Dinamik fiyatlandırma kuralları (İlk 10 km 1000 TL, 11. km'den itibaren 50 TL/km)
    const pricing = await PricingService.calculatePrice({
      serviceType,
      distanceKm: route.totalDistanceKm,
      durationMinutes: route.totalDurationMinutes,
      petWeightKg: Number(petWeightKg),
      hasCompanion: Boolean(hasCompanion)
    });

    return res.json({
      success: true,
      data: {
        route,
        pricing
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. Rezervasyon Oluşturma Endpoint'i
 */
apiRouter.post('/bookings', async (req: Request, res: Response) => {
  try {
    const validatedData = CreateBookingSchema.parse(req.body);
    const booking = await BookingService.createBooking(validatedData as any);
    return res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.errors || error.message });
  }
});

/**
 * 3. Rezervasyon Listeleme
 */
apiRouter.get('/bookings', async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;
    const bookings = await BookingService.getBookings({
      userId: userId as string,
      status: status as any
    });
    return res.json({ success: true, data: bookings });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. Rezervasyon Durumu Güncelleme (Admin / Şoför)
 */
apiRouter.patch('/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, driverId, vehiclePlate } = req.body;
    await BookingService.updateBookingStatus(id, status, { driverId, vehiclePlate });
    return res.json({ success: true, message: `Rezervasyon durumu ${status} olarak güncellendi.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. WhatsApp Canlı Konum Bağlama
 */
apiRouter.post('/bookings/:id/whatsapp-tracking', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { liveLocationUrl, driverPhone } = req.body;

    if (!liveLocationUrl) {
      return res.status(400).json({ error: 'liveLocationUrl zorunludur.' });
    }

    await BookingService.attachWhatsAppTracking(id, liveLocationUrl, driverPhone);
    return res.json({ success: true, message: 'WhatsApp canlı konum başarıyla bağlandı.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. Admin: Fiyatlandırma Ayarlarını Getir
 */
apiRouter.get('/admin/pricing', async (_req: Request, res: Response) => {
  try {
    const settings = await PricingService.getPricingSettings();
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 7. Admin: Fiyatlandırma Ayarlarını Güncelle
 */
apiRouter.put('/admin/pricing', async (req: Request, res: Response) => {
  try {
    const validatedSettings = UpdatePricingSettingsSchema.parse(req.body);
    const adminId = (req as any).user?.id || 'admin_user';
    const updated = await PricingService.updatePricingSettings(validatedSettings, adminId);
    return res.json({ success: true, message: 'Fiyatlandırma ayarları güncellendi.', data: updated });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.errors || error.message });
  }
});

/**
 * 8. S.A.H (Sahipsiz Hayvanlar) Ücretsiz Sahiplendirme İlanları
 */
apiRouter.get('/sah/listings', async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection(COLLECTIONS.SAH_LISTINGS).get();
    const listings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, data: listings });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/sah/listings', async (req: Request, res: Response) => {
  try {
    const { title, species, ageText, description, location, contactPhone } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'İlan başlığı ve açıklaması zorunludur.' });
    }
    const ref = db.collection(COLLECTIONS.SAH_LISTINGS).doc();
    const item = {
      id: ref.id,
      title,
      species: species || 'CAT',
      ageText: ageText || 'Bilinmiyor',
      description,
      location: location || 'İzmir',
      contactPhone: contactPhone || '',
      status: 'PENDING_APPROVAL',
      reportsCount: 0,
      createdAt: new Date().toISOString()
    };
    await ref.set(item);
    return res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 9. S.A.H İlan Şikayet Et / Bildir (Google Play UGC Politikası Zorunluluğu)
 */
apiRouter.post('/sah/listings/:id/report', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const ref = db.collection(COLLECTIONS.SAH_LISTINGS).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'İlan bulunamadı.' });
    }
    const current = doc.data() || {};
    await ref.update({
      reportsCount: (current.reportsCount || 0) + 1,
      lastReportReason: reason || 'Uygunsuz içerik bildirimi'
    });
    return res.json({ success: true, message: 'İlan inceleme ekibine bildirildi.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 10. Pet + Care Ürün Listesi
 */
apiRouter.get('/products', async (_req: Request, res: Response) => {
  const defaultProducts = [
    { id: 'prod-1', name: 'Arya Probiyotik Macun (100g)', category: 'Sindirim Sağlığı', priceTl: 320, inStock: true },
    { id: 'prod-2', name: 'Aloe Vera Kuru Köpük Şampuan', category: 'Hijyen & Bakım', priceTl: 240, inStock: true },
    { id: 'prod-3', name: 'Saf Norveç Somon Yağı (Omega-3)', category: 'Tüy & Eklem', priceTl: 410, inStock: true },
    { id: 'prod-4', name: 'Organik Pati Koruyucu Balmumu Krem', category: 'Pati Bakımı', priceTl: 180, inStock: true }
  ];
  return res.json({ success: true, data: defaultProducts });
});

/**
 * 11. Pet Kuaför Randevu Oluşturma
 */
apiRouter.post('/grooming/appointments', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, petName, packageTitle, priceTl, includeVipTransport, appointmentDate } = req.body;
    if (!customerName || !packageTitle) {
      return res.status(400).json({ success: false, error: 'Müşteri adı ve paket seçimi zorunludur.' });
    }
    const ref = db.collection(COLLECTIONS.GROOMING).doc();
    const record = {
      id: ref.id,
      customerName,
      customerPhone: customerPhone || '',
      petName: petName || '',
      packageTitle,
      priceTl: Number(priceTl) || 950,
      includeVipTransport: Boolean(includeVipTransport),
      appointmentDate: appointmentDate || new Date().toISOString(),
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };
    await ref.set(record);
    return res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
