import { AdminPricingSettings, PriceBreakdown, ServiceType, PetSizeCategory } from '../types';
import { db, COLLECTIONS } from '../config/firebase';

export type DynamicPricingConfig = AdminPricingSettings;

// Varsayılan Fiyatlandırma Ayarları (Admin panelden tek tıkla güncellenebilir)
export const DEFAULT_PRICING_CONFIG: DynamicPricingConfig = {
  id: 'current_pricing',
  baseFareCityIn: 1000,              // 0-10 km arası sabit 1.000 TL
  includedKmCityIn: 10,              // Dahil olan ilk 10 km
  extraPerKmRateCityIn: 50,          // 11. km'den itibaren km başı 50 TL
  perKmRateCityIn: 50,               // Geriye dönük uyumluluk
  perKmRateCityOut: 35,              // Şehirlerarası KM başı baz ücret
  companionRateCityOutPerKm: 3,      // Şehirlerarası refakatçi km başı +3 TL
  sizeMultipliers: {
    SMALL: 1.0,                      // 0 - 10 kg
    MEDIUM: 1.2,                     // 11 - 25 kg
    LARGE: 1.4,                      // 26 - 45 kg
    GIANT: 1.6                       // 45+ kg
  },
  trafficFactorMultiplier: 1.15,
  enableTrafficFactor: false,        // Kullanıcının sadeleşme talebi doğrultusunda varsayılan kapalı
  updatedAt: new Date().toISOString(),
  updatedBy: 'system_default'
};

export class PricingService {
  public static async getPricingSettings(): Promise<DynamicPricingConfig> {
    try {
      const doc = await db.collection(COLLECTIONS.SETTINGS).doc('current_pricing').get();
      if (doc.exists) {
        return { ...DEFAULT_PRICING_CONFIG, ...doc.data() } as DynamicPricingConfig;
      }
    } catch (e) {
      // Fallback
    }
    return DEFAULT_PRICING_CONFIG;
  }

  public static async updatePricingSettings(newSettings: Partial<DynamicPricingConfig>, adminId: string): Promise<DynamicPricingConfig> {
    const current = await this.getPricingSettings();
    const updated: DynamicPricingConfig = {
      ...current,
      ...newSettings,
      id: 'current_pricing',
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    };

    await db.collection(COLLECTIONS.SETTINGS).doc('current_pricing').set(updated);
    return updated;
  }

  public static determineSizeCategory(weightKg: number): PetSizeCategory {
    if (weightKg <= 10) return 'SMALL';
    if (weightKg <= 25) return 'MEDIUM';
    if (weightKg <= 45) return 'LARGE';
    return 'GIANT';
  }

  /**
   * Fiyat Hesaplama Motoru
   * - İzmir Şehir İçi: İlk 10 km SABİT 1.000 TL. 11. km'den itibaren KM başı 50 TL. Refakatçi 0 TL.
   * - Şehirlerarası: KM x Şehirlerarası KM Ücreti x Boyut Çarpanı + Refakatçi
   */
  public static async calculatePrice(params: {
    serviceType: ServiceType;
    distanceKm: number;
    durationMinutes: number;
    petWeightKg: number;
    hasCompanion: boolean;
  }): Promise<PriceBreakdown> {
    const settings = await this.getPricingSettings();
    const { serviceType, distanceKm, durationMinutes, petWeightKg, hasCompanion } = params;

    let baseFare = 0;
    let distanceFare = 0;
    let sizeMultiplier = 1.0;
    let companionFee = 0;

    if (serviceType === 'CITY_IN') {
      // 1) İZMİR ŞEHİR İÇİ (SABİT 10 KM KURALI)
      baseFare = settings.baseFareCityIn; // 1.000 TL
      const includedKm = settings.includedKmCityIn || 10;
      const extraKmRate = settings.extraPerKmRateCityIn || 50;

      if (distanceKm > includedKm) {
        const extraKm = distanceKm - includedKm;
        distanceFare = extraKm * extraKmRate;
      } else {
        distanceFare = 0; // İlk 10 km içinde ekstra mesafe ücreti yok, sabit 1000 TL
      }
      companionFee = 0; // Refakatçi şehir içi ücretsiz
      sizeMultiplier = 1.0;
    } else {
      // 2) ŞEHİRLERARASI
      const sizeCategory = this.determineSizeCategory(petWeightKg);
      sizeMultiplier = settings.sizeMultipliers[sizeCategory] || 1.0;
      baseFare = 0;
      distanceFare = distanceKm * settings.perKmRateCityOut * sizeMultiplier;

      if (hasCompanion) {
        companionFee = distanceKm * settings.companionRateCityOutPerKm;
      }
    }

    const totalPrice = Math.round(baseFare + distanceFare + companionFee);

    return {
      serviceType,
      distanceKm: Number(distanceKm.toFixed(1)),
      durationMinutes: Math.round(durationMinutes),
      baseFare,
      distanceFare: Math.round(distanceFare),
      sizeMultiplier,
      companionFee: Math.round(companionFee),
      trafficMultiplier: 1.0,
      totalPrice,
      currency: 'TRY'
    };
  }
}
