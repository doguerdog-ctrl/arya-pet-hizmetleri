import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../models/pet_and_booking.dart';

class ApiService {
  // Geliştirme ortamı için Android Emulator localhost'u (10.0.2.2) veya gerçek IP
  static const String baseUrl = 'http://10.0.2.2:4000/api';

  // Canlı Fiyat Tahmini Alma
  static Future<PriceEstimateModel> getPriceEstimate({
    required ServiceType serviceType,
    required LocationPointModel origin,
    required LocationPointModel destination,
    required double petWeightKg,
    required bool hasCompanion,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pricing/estimate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'serviceType': serviceType == ServiceType.cityIn ? 'CITY_IN' : 'CITY_OUT',
          'origin': {
            'address': origin.address,
            'latitude': origin.latitude,
            'longitude': origin.longitude,
          },
          'destination': {
            'address': destination.address,
            'latitude': destination.latitude,
            'longitude': destination.longitude,
          },
          'petWeightKg': petWeightKg,
          'hasCompanion': hasCompanion,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body)['data']['pricing'];
        return PriceEstimateModel(
          distanceKm: (data['distanceKm'] as num).toDouble(),
          durationMinutes: (data['durationMinutes'] as num).toInt(),
          baseFare: (data['baseFare'] as num).toDouble(),
          distanceFare: (data['distanceFare'] as num).toDouble(),
          companionFee: (data['companionFee'] as num).toDouble(),
          totalPrice: (data['totalPrice'] as num).toDouble(),
        );
      }
    } catch (e) {
      // Çevrimdışı / Simülasyon yedek modu (Kullanıcı deneyimi bozulmasın)
    }

    // Yedek hesap (İzmir 1000 TL açılış kuralı)
    final isCityIn = serviceType == ServiceType.cityIn;
    final baseFare = isCityIn ? 1000.0 : 0.0;
    final km = isCityIn ? 18.0 : 450.0;
    final kmRate = isCityIn ? 25.0 : 35.0;
    final companionFee = (!isCityIn && hasCompanion) ? km * 3.0 : 0.0;
    final total = baseFare + (km * kmRate) + companionFee;

    return PriceEstimateModel(
      distanceKm: km,
      durationMinutes: isCityIn ? 35 : 320,
      baseFare: baseFare,
      distanceFare: km * kmRate,
      companionFee: companionFee,
      totalPrice: total,
    );
  }

  // WhatsApp Canlı Konum Linkini Başlatma
  static Future<bool> launchWhatsAppTracking(String urlOrPhone) async {
    final uri = Uri.parse(urlOrPhone.startsWith('http') 
        ? urlOrPhone 
        : 'https://wa.me/$urlOrPhone?text=Merhaba,%20Arya%20Pet%20Nakil%20aracımdaki%20canlı%20konumu%20öğrenmek%20istiyorum.');
    
    if (await canLaunchUrl(uri)) {
      return await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
    return false;
  }
}
