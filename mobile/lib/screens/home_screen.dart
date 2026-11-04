import 'package:flutter/material.dart';
import '../models/pet_and_booking.dart';
import '../theme/app_theme.dart';
import 'booking_form_screen.dart';
import 'my_pets_screen.dart';
import 'tracking_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final BookingItemModel _activeMockBooking = BookingItemModel(
    id: 'demo_101',
    bookingCode: 'ARYA-2026-8842',
    pet: PetModel(
      id: 'p1',
      name: 'Luna',
      type: PetType.dog,
      breed: 'Golden Retriever',
      weightKg: 24.5,
    ),
    serviceType: ServiceType.cityIn,
    origin: LocationPointModel(
      title: 'Kalkış',
      address: 'Karşıyaka Çarşı, İzmir',
      latitude: 38.4550,
      longitude: 27.1080,
    ),
    destination: LocationPointModel(
      title: 'Varış',
      address: 'Alsancak Kordon, İzmir',
      latitude: 38.4350,
      longitude: 27.1420,
    ),
    pickupDateTime: DateTime.now(),
    hasCompanion: false,
    breakInterval: '2 Saatte Bir',
    totalPrice: 1375,
    status: 'TRANSFERDE (YOLDA)',
    whatsappTrackingUrl: 'https://chat.whatsapp.com/sample-live-location',
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryTeal.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.pets, color: AppTheme.primaryTeal, size: 20),
            ),
            const SizedBox(width: 8),
            const Text('Arya Pet Hizmetleri'),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Üst Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryTeal, Color(0xFF115E59)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Güvenli & Konforlu Nakil 🐾',
                    style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'İzmir şehir içi ve tüm Türkiye\'ye sterilize özel kabinler ve profesyonel refakat ile pet transferi.',
                    style: TextStyle(color: Color(0xFFCCFBF1), fontSize: 13, height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.primaryTeal,
                      minimumSize: const Size(180, 44),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const BookingFormScreen()),
                      );
                    },
                    child: const Text('Hemen Rezervasyon Yap'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Aktif Transfer Kartı (Varsa)
            const Text(
              'Aktif Transferiniz',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 10),
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => TrackingScreen(booking: _activeMockBooking)),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Card(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const CircleAvatar(
                                radius: 20,
                                backgroundColor: Color(0xFFDCFCE7),
                                child: Text('🐶', style: TextStyle(fontSize: 20)),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _activeMockBooking.pet.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  Text(
                                    _activeMockBooking.bookingCode,
                                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.whatsappGreen.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'YOLDA 🚗',
                              style: TextStyle(
                                color: Color(0xFF166534),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.share_location_rounded, size: 18, color: AppTheme.whatsappGreen),
                              SizedBox(width: 6),
                              Text('WhatsApp Canlı Konumu Hazır', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                            ],
                          ),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.textMuted),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Hızlı Menü
            const Text(
              'Arya Pet Hizmetleri Ekosistemi',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.local_shipping_rounded,
                    title: 'Pet Nakil (VIP)',
                    subtitle: '10 km 1.000 TL Sabit',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const BookingFormScreen()),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.content_cut_rounded,
                    title: 'Pet Kuaför',
                    subtitle: 'Tıraş, Banyo & Nakil',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Pet Kuaför randevu ekranı açılıyor...')),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.local_hospital_rounded,
                    title: 'Nöbetçi Veteriner',
                    subtitle: '7/24 Acil & Ambulans',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('En yakın nöbetçi veteriner klinikleri listeleniyor...')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.shopping_bag_rounded,
                    title: 'Pet + Care',
                    subtitle: 'Probiyotik & Bakım',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Pet + Care sağlık mağazası açılıyor...')),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.volunteer_activism_rounded,
                    title: 'S.A.H Yuva Ol',
                    subtitle: '%100 Ücretsiz İlanlar',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('S.A.H ücretsiz sahiplendirme platformu açılıyor...')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionTile(
                    icon: Icons.menu_book_rounded,
                    title: 'Hayvan Ansiklopedisi',
                    subtitle: 'Aşı, Bakım & İlk Yardım',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Arya Hayvan Ansiklopedisi & Rehberi açılıyor...')),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) {
          setState(() => _currentIndex = idx);
          if (idx == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const BookingFormScreen()),
            );
          } else if (idx == 2) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const MyPetsScreen()),
            );
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_rounded), label: 'Ana Sayfa'),
          NavigationDestination(icon: Icon(Icons.add_location_alt_rounded), label: 'Transfer'),
          NavigationDestination(icon: Icon(Icons.pets_rounded), label: 'Patilerim'),
        ],
      ),
    );
  }

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryTeal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: AppTheme.primaryTeal, size: 22),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textDark),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
