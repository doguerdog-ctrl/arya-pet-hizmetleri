enum PetType { dog, cat, bird, exotic, other }
enum CagePreference { clientProvides, companyProvides }
enum ClimatePreference { standard, coolAc, warm }
enum ServiceType { cityIn, cityOut }

class PetModel {
  final String id;
  final String name;
  final PetType type;
  final String breed;
  final double weightKg;
  final String healthNotes;
  final CagePreference cagePref;
  final ClimatePreference climatePref;

  PetModel({
    required this.id,
    required this.name,
    required this.type,
    required this.breed,
    required this.weightKg,
    this.healthNotes = '',
    this.cagePref = CagePreference.companyProvides,
    this.climatePref = ClimatePreference.standard,
  });

  String get typeLabel {
    switch (type) {
      case PetType.dog: return 'Köpek';
      case PetType.cat: return 'Kedi';
      case PetType.bird: return 'Kuş';
      case PetType.exotic: return 'Egzotik';
      default: return 'Diğer';
    }
  }
}

class LocationPointModel {
  final String title;
  final String address;
  final double latitude;
  final double longitude;

  LocationPointModel({
    required this.title,
    required this.address,
    required this.latitude,
    required this.longitude,
  });
}

class PriceEstimateModel {
  final double distanceKm;
  final int durationMinutes;
  final double baseFare;
  final double distanceFare;
  final double companionFee;
  final double totalPrice;
  final String currency;

  PriceEstimateModel({
    required this.distanceKm,
    required this.durationMinutes,
    required this.baseFare,
    required this.distanceFare,
    required this.companionFee,
    required this.totalPrice,
    this.currency = 'TL',
  });
}

class BookingItemModel {
  final String id;
  final String bookingCode;
  final PetModel pet;
  final ServiceType serviceType;
  final LocationPointModel origin;
  final LocationPointModel destination;
  final DateTime pickupDateTime;
  final bool hasCompanion;
  final String breakInterval;
  final double totalPrice;
  final String status;
  final String? whatsappTrackingUrl;

  BookingItemModel({
    required this.id,
    required this.bookingCode,
    required this.pet,
    required this.serviceType,
    required this.origin,
    required this.destination,
    required this.pickupDateTime,
    required this.hasCompanion,
    required this.breakInterval,
    required this.totalPrice,
    required this.status,
    this.whatsappTrackingUrl,
  });
}
