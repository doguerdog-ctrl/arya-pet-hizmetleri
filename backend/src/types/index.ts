export type UserRole = 'CUSTOMER' | 'ADMIN' | 'DRIVER';

export type PetType = 'DOG' | 'CAT' | 'BIRD' | 'EXOTIC' | 'OTHER';

export type PetSizeCategory = 'SMALL' | 'MEDIUM' | 'LARGE' | 'GIANT';

export type CagePreference = 'CLIENT_PROVIDES' | 'COMPANY_PROVIDES';

export type ClimatePreference = 'STANDARD' | 'COOL_AC' | 'WARM' | 'SPECIAL_TEMPERATURE';

export type ServiceType = 'CITY_IN' | 'CITY_OUT'; // CITY_IN: İzmir içi, CITY_OUT: Şehirlerarası

export type BookingStatus = 
  | 'PENDING'          // Beklemede (Onay bekliyor)
  | 'CONFIRMED'        // Onaylandı (Araç ve saat tahsis edildi)
  | 'DRIVER_ASSIGNED'  // Sürücü atandı
  | 'IN_TRANSIT'       // Nakil başladı (Yolda)
  | 'COMPLETED'        // Tamamlandı
  | 'CANCELLED';       // İptal edildi

export interface LocationPoint {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
}

export interface PetCareSchedule {
  feedingInstructions?: string;     // Beslenme talimatı
  feedingTimes?: string[];          // Örn: ["09:00", "15:00"]
  breakIntervalHours?: number;      // Mola sıklığı (Örn: Her 2 saatte bir 15 dk)
  specialNeedsNotes?: string;       // İlaç, araç tutması, özel su ihtiyacı vb.
}

export interface PriceBreakdown {
  serviceType: ServiceType;
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;               // Şehir içi başlangıç ücreti (Örn: 1000 TL)
  distanceFare: number;           // KM bazlı hesaplanan toplam ücret
  sizeMultiplier: number;         // Şehirlerarasında uygulanan boyut katsayısı
  companionFee: number;           // Şehirlerarasında varsa refakatçi ücreti
  trafficMultiplier: number;      // Anlık trafik durumuna göre ek çarpan (varsa)
  totalPrice: number;             // Nihai toplam tutar
  currency: 'TRY';
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: PetType;
  breed?: string;
  weightKg: number;
  sizeCategory: PetSizeCategory;
  hasHealthNotes: boolean;
  healthNotes?: string;
  isVaccinated: boolean;
  temperamentNotes?: string;      // Agresiflik, korku, hareketlilik durumu
  cagePreference: CagePreference;
  climatePreference: ClimatePreference;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Booking {
  id: string;
  bookingCode: string;            // Örn: ARYA-2026-1049
  userId: string;
  customerName: string;
  customerPhone: string;
  pet: Pet;
  serviceType: ServiceType;
  origin: LocationPoint;
  destination: LocationPoint;
  pickupDateTime: Date | string;
  estimatedArrivalDateTime?: Date | string;
  hasCompanion: boolean;          // Refakatçi pet sahibi araçta mı?
  careSchedule: PetCareSchedule;
  pricing: PriceBreakdown;
  status: BookingStatus;
  
  // WhatsApp Canlı Takip Entegrasyonu
  whatsappTracking?: {
    driverPhoneNumber?: string;
    liveLocationUrl?: string;     // Sürücünün WhatsApp canlı konum linki
    shareMessageSent?: boolean;
  };

  assignedDriverId?: string;
  assignedVehiclePlate?: string;
  adminNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminPricingSettings {
  id: 'current_pricing';
  baseFareCityIn: number;         // İzmir içi başlangıç ücreti (Varsayılan: 1000 TL)
  includedKmCityIn: number;       // İzmir içi taban ücrete dahil ilk km sınırı (Varsayılan: 10 km)
  extraPerKmRateCityIn: number;   // Dahil km sonrası her km için ek ücret (Varsayılan: 50 TL)
  perKmRateCityIn?: number;       // Eski alan (geriye dönük uyumluluk), fiyat hesabında kullanılmaz
  perKmRateCityOut: number;       // Şehirlerarası KM başı baz ücret (Örn: 35 TL)
  companionRateCityOutPerKm: number; // Şehirlerarasında refakatçi ek km ücreti (Örn: 5 TL/km)
  
  // Şehirlerarası için boyut katsayıları
  sizeMultipliers: {
    SMALL: number;                // 0 - 10 kg (Varsayılan: 1.0)
    MEDIUM: number;               // 11 - 25 kg (Varsayılan: 1.2)
    LARGE: number;                // 26 - 45 kg (Varsayılan: 1.4)
    GIANT: number;                // 45+ kg (Varsayılan: 1.6)
  };

  // Trafik yoğunluğu ayarları
  trafficFactorMultiplier: number; // Şehir içi ağır trafikte uygulanacak min/max çarpan (Örn: 1.15)
  enableTrafficFactor: boolean;

  updatedAt: Date | string;
  updatedBy: string;
}
