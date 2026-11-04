import 'package:flutter/material.dart';
import '../models/pet_and_booking.dart';
import '../models/pet_passport.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class TrackingScreen extends StatelessWidget {
  final BookingItemModel booking;

  TrackingScreen({Key? key, required this.booking}) : super(key: key);

  final List<JourneyLogEntry> _mockTimeline = [
    JourneyLogEntry(
      time: '10:30',
      title: 'Yolculuk Başladı',
      description: 'Luna İzmir Karşıyaka adresinden güvenle teslim alındı ve steril kabine yerleştirildi.',
      icon: Icons.check_circle_rounded,
    ),
    JourneyLogEntry(
      time: '11:45',
      title: '1. Su & Havalandırma Molası',
      description: 'Araç durduruldu, taze su verildi, kabin içi hava sirkülasyonu sağlandı.',
      icon: Icons.water_drop_rounded,
    ),
    JourneyLogEntry(
      time: '13:00',
      title: 'Mola ve Beslenme',
      description: 'Planlanan mama saati uygulandı. Pet keyfi yerinde, seyahat konforlu ilerliyor.',
      icon: Icons.restaurant_rounded,
    ),
    JourneyLogEntry(
      time: '14:30',
      title: 'Varış Noktasına Yaklaşıldı',
      description: 'Tahmini varışa 20 dakika kaldı. Alıcı ile irtibata geçildi.',
      icon: Icons.navigation_rounded,
      isCompleted: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Arya Canlı Takip'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Durum Kartı
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryTeal.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        booking.status,
                        style: const TextStyle(
                          color: AppTheme.primaryTeal,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      booking.bookingCode,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        color: AppTheme.textDark,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${booking.pet.name} (${booking.pet.typeLabel}) için transfer planlandı',
                      style: const TextStyle(color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. WHATSAPP CANLI KONUM TAKİP BUTONU
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFFDCFCE7),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppTheme.whatsappGreen, width: 1.5),
              ),
              child: Column(
                children: [
                  const Icon(Icons.share_location_rounded, size: 40, color: Color(0xFF166534)),
                  const SizedBox(height: 8),
                  const Text(
                    'Sürücü WhatsApp Canlı Konumu',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF166534),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Özel nakil aracımızın anlık WhatsApp canlı konumunu ve seyrini harita üzerinden canlı izleyin.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Color(0xFF15803D)),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.whatsappGreen,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      final url = booking.whatsappTrackingUrl ?? 'https://wa.me/905000000000';
                      ApiService.launchWhatsAppTracking(url);
                    },
                    icon: const Icon(Icons.location_on_rounded),
                    label: const Text(
                      'WhatsApp\'ta Canlı Konumu Aç',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 3. Sürücü Canlı Günlüğü / Mola ve Beslenme Zaman Çizelgesi
            const Text(
              '🐾 Seyir & Bakım Günlüğü (Canlı Akış)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: _mockTimeline.map((item) => _buildTimelineItem(item)).toList(),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 4. Güzergah ve İletişim
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Güzergah & Transfer Detayı', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 12),
                    _buildRouteRow('Alınış Yeri', booking.origin.address, AppTheme.primaryTeal),
                    const Padding(
                      padding: EdgeInsets.only(left: 6),
                      child: SizedBox(height: 16, child: VerticalDivider(thickness: 1.5, color: Color(0xFFCBD5E1))),
                    ),
                    _buildRouteRow('Teslim Yeri', booking.destination.address, Colors.redAccent),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Arya Pet Operasyon:', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                        TextButton.icon(
                          onPressed: () => ApiService.launchWhatsAppTracking('+905550000000'),
                          icon: const Icon(Icons.phone_in_talk_rounded, size: 16, color: AppTheme.primaryTeal),
                          label: const Text('Merkezi Ara', style: TextStyle(color: AppTheme.primaryTeal, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem(JourneyLogEntry item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: item.isCompleted ? AppTheme.primaryTeal.withOpacity(0.12) : const Color(0xFFF1F5F9),
              shape: BoxShape.circle,
            ),
            child: Icon(
              item.icon,
              size: 18,
              color: item.isCompleted ? AppTheme.primaryTeal : const Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item.title,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: item.isCompleted ? AppTheme.textDark : AppTheme.textMuted,
                      ),
                    ),
                    Text(
                      item.time,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  item.description,
                  style: const TextStyle(color: Color(0xFF475569), fontSize: 12, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteRow(String label, String address, Color dotColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.circle, size: 14, color: dotColor),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
              Text(address, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }
}
