import { Booking, BookingStatus, LocationPoint, Pet, ServiceType } from '../types';
import { db, COLLECTIONS } from '../config/firebase';
import { MapService } from './mapService';
import { PricingService } from './pricingService';

export class BookingNotFoundError extends Error {
  constructor(bookingId: string) {
    super(`Rezervasyon bulunamadı: ${bookingId}`);
    this.name = 'BookingNotFoundError';
  }
}

export class BookingService {
  /**
   * Yeni bir rezervasyon oluşturur, Maps üzerinden rota & fiyat hesaplar ve Firestore'a kaydeder.
   */
  public static async createBooking(data: {
    userId: string;
    customerName: string;
    customerPhone: string;
    pet: Pet;
    serviceType: ServiceType;
    origin: LocationPoint;
    destination: LocationPoint;
    pickupDateTime: string | Date;
    hasCompanion: boolean;
    careSchedule?: any;
  }): Promise<Booking> {
    // 1. Google Maps ile mesafe ve süre hesaplama
    const route = await MapService.calculateRoute(data.origin, data.destination);

    // 2. Fiyatlandırma motorunu çalıştırma
    const pricing = await PricingService.calculatePrice({
      serviceType: data.serviceType,
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      petWeightKg: data.pet.weightKg,
      hasCompanion: data.hasCompanion
    });

    const bookingRef = db.collection(COLLECTIONS.BOOKINGS).doc();
    const randomCodeSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `ARYA-${new Date().getFullYear()}-${randomCodeSuffix}`;

    const newBooking: Booking = {
      id: bookingRef.id,
      bookingCode,
      userId: data.userId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      pet: data.pet,
      serviceType: data.serviceType,
      origin: data.origin,
      destination: data.destination,
      pickupDateTime: new Date(data.pickupDateTime).toISOString(),
      hasCompanion: data.hasCompanion,
      careSchedule: data.careSchedule || {
        breakIntervalHours: 2
      },
      pricing,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await bookingRef.set(newBooking);

    return newBooking;
  }

  /**
   * Rezervasyon durumunu günceller (Örn: Sürücü atandı, Yolda, Tamamlandı)
   */
  public static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    driverInfo?: { driverId?: string; vehiclePlate?: string }
  ): Promise<Booking> {
    const ref = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new BookingNotFoundError(bookingId);

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (driverInfo?.driverId) updateData.assignedDriverId = driverInfo.driverId;
    if (driverInfo?.vehiclePlate) updateData.assignedVehiclePlate = driverInfo.vehiclePlate;

    await ref.update(updateData);
    return { ...(snapshot.data() as Booking), ...updateData };
  }

  /**
   * Sürücünün WhatsApp Canlı Konum linkini rezervasyona bağlama
   * Kullanıcı bu linke tıklandığında WhatsApp'ta canlı konumu görebilir.
   */
  public static async attachWhatsAppTracking(
    bookingId: string,
    whatsappLocationUrl: string,
    driverPhone?: string
  ): Promise<void> {
    const ref = db.collection(COLLECTIONS.BOOKINGS).doc(bookingId);
    if (!(await ref.get()).exists) throw new BookingNotFoundError(bookingId);

    await ref.update({
      whatsappTracking: {
        liveLocationUrl: whatsappLocationUrl,
        ...(driverPhone ? { driverPhoneNumber: driverPhone } : {}),
        shareMessageSent: true
      },
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Kullanıcı veya Admin için rezervasyonları listeleme
   */
  public static async getBookings(filters?: { userId?: string; status?: BookingStatus }): Promise<Booking[]> {
    let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.BOOKINGS);

    if (filters?.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    const snapshot = await query.get();
    return snapshot.docs
      .map(doc => doc.data() as Booking)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); // En yeni üstte
  }
}
