import { z } from 'zod';

export const LocationPointSchema = z.object({
  address: z.string().min(5, 'Adres en az 5 karakter olmalıdır.'),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().optional(),
  district: z.string().optional()
});

export const PetCareScheduleSchema = z.object({
  feedingInstructions: z.string().optional(),
  feedingTimes: z.array(z.string()).optional(),
  breakIntervalHours: z.number().min(1).max(8).optional().default(2),
  specialNeedsNotes: z.string().optional()
});

export const PetSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(2, 'Pet ismi en az 2 karakter olmalıdır.'),
  type: z.enum(['DOG', 'CAT', 'BIRD', 'EXOTIC', 'OTHER']),
  breed: z.string().optional(),
  weightKg: z.number().positive('Ağırlık pozitif bir değer olmalıdır.'),
  sizeCategory: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'GIANT']),
  hasHealthNotes: z.boolean().default(false),
  healthNotes: z.string().optional(),
  isVaccinated: z.boolean().default(true),
  temperamentNotes: z.string().optional(),
  cagePreference: z.enum(['CLIENT_PROVIDES', 'COMPANY_PROVIDES']),
  climatePreference: z.enum(['STANDARD', 'COOL_AC', 'WARM', 'SPECIAL_TEMPERATURE']).default('STANDARD')
});

export const CreateBookingSchema = z.object({
  userId: z.string(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(10, 'Geçerli bir telefon numarası giriniz.'),
  pet: PetSchema,
  serviceType: z.enum(['CITY_IN', 'CITY_OUT']),
  origin: LocationPointSchema,
  destination: LocationPointSchema,
  pickupDateTime: z.string().or(z.date()),
  hasCompanion: z.boolean().default(false),
  careSchedule: PetCareScheduleSchema.default({})
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
});

export const AttachWhatsAppTrackingSchema = z.object({
  liveLocationUrl: z
    .string()
    .url('Geçerli bir link giriniz.')
    .refine(url => /^https?:\/\//i.test(url), 'Link http(s) ile başlamalıdır.'),
  driverPhone: z.string().optional()
});

export const UpdatePricingSettingsSchema = z.object({
  baseFareCityIn: z.number().min(0, 'Başlangıç ücreti negatif olamaz.'),
  includedKmCityIn: z.number().min(0, 'Dahil km negatif olamaz.'),
  extraPerKmRateCityIn: z.number().min(0, 'Ek km ücreti negatif olamaz.'),
  perKmRateCityIn: z.number().min(0).optional(),
  perKmRateCityOut: z.number().min(0),
  companionRateCityOutPerKm: z.number().min(0),
  sizeMultipliers: z.object({
    SMALL: z.number().min(0.5),
    MEDIUM: z.number().min(0.5),
    LARGE: z.number().min(0.5),
    GIANT: z.number().min(0.5)
  }),
  trafficFactorMultiplier: z.number().min(1.0).max(2.0),
  enableTrafficFactor: z.boolean()
});
