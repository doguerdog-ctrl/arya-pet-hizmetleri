import 'package:flutter/material.dart';
import '../models/pet_and_booking.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'tracking_screen.dart';

class BookingFormScreen extends StatefulWidget {
  const BookingFormScreen({Key? key}) : super(key: key);

  @override
  State<BookingFormScreen> createState() => _BookingFormScreenState();
}

class _BookingFormScreenState extends State<BookingFormScreen> {
  ServiceType _serviceType = ServiceType.cityIn;
  PetType _petType = PetType.dog;
  
  final _nameController = TextEditingController(text: 'Luna');
  final _weightController = TextEditingController(text: '12');
  final _healthController = TextEditingController();
  final _pickupAddressController = TextEditingController(text: 'Karşıyaka Çarşı, İzmir');
  final _dropoffAddressController = TextEditingController(text: 'Alsancak Kordon, İzmir');
  
  CagePreference _cagePref = CagePreference.companyProvides;
  ClimatePreference _climatePref = ClimatePreference.coolAc;
  bool _hasCompanion = false;
  String _breakInterval = '2 Saatte Bir';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 10, minute: 30);

  bool _isLoadingPrice = false;
  PriceEstimateModel? _priceEstimate;

  @override
  void initState() {
    super.initState();
    _recalculatePrice();
  }

  void _recalculatePrice() async {
    setState(() => _isLoadingPrice = true);
    final weight = double.tryParse(_weightController.text) ?? 10.0;
    
    final estimate = await ApiService.getPriceEstimate(
      serviceType: _serviceType,
      origin: LocationPointModel(
        title: 'Kalkış',
        address: _pickupAddressController.text,
        latitude: 38.4550,
        longitude: 27.1080,
      ),
      destination: LocationPointModel(
        title: 'Varış',
        address: _dropoffAddressController.text,
        latitude: 38.4350,
        longitude: 27.1420,
      ),
      petWeightKg: weight,
      hasCompanion: _hasCompanion,
    );

    setState(() {
      _priceEstimate = estimate;
      _isLoadingPrice = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isCityIn = _serviceType == ServiceType.cityIn;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Arya Pet Nakil Rezervasyonu'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Hizmet Tipi Seçimi
            _buildSectionHeader('1. Transfer Tipi', Icons.route_rounded),
            Row(
              children: [
                Expanded(
                  child: _buildServiceTypeButton(
                    title: 'İzmir Şehir İçi',
                    subtitle: '1.000 TL Açılış',
                    type: ServiceType.cityIn,
                    selected: isCityIn,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildServiceTypeButton(
                    title: 'Şehirlerarası',
                    subtitle: 'Mesafe & Boyut Bazlı',
                    type: ServiceType.cityOut,
                    selected: !isCityIn,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // 2. Pet Bilgileri & Sağlık
            _buildSectionHeader('2. Evcil Hayvan Bilgileri', Icons.pets_rounded),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<PetType>(
                            value: _petType,
                            decoration: const InputDecoration(labelText: 'Tür'),
                            items: const [
                              DropdownMenuItem(value: PetType.dog, child: Text('Köpek 🐶')),
                              DropdownMenuItem(value: PetType.cat, child: Text('Kedi 🐱')),
                              DropdownMenuItem(value: PetType.bird, child: Text('Kuş 🦜')),
                              DropdownMenuItem(value: PetType.exotic, child: Text('Egzotik 🦎')),
                            ],
                            onChanged: (val) {
                              if (val != null) setState(() => _petType = val);
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _weightController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Ağırlık (kg)'),
                            onChanged: (_) => _recalculatePrice(),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(labelText: 'Pet İsmi'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _healthController,
                      decoration: const InputDecoration(
                        labelText: 'Sağlık / Araç Tutması / Özel Notlar (Opsiyonel)',
                        hintText: 'Aşıları tam, araçta mide bulantısı olabilir vb.',
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 3. Konfor, İklimlendirme & Mola Planı
            _buildSectionHeader('3. Konfor & İklimlendirme', Icons.ac_unit_rounded),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: [
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Özel Kafes Araçtan Temin Edilsin'),
                      subtitle: const Text('Arya Pet sabit, sterilize taşıma boxı'),
                      value: _cagePref == CagePreference.companyProvides,
                      activeColor: AppTheme.primaryTeal,
                      onChanged: (val) {
                        setState(() {
                          _cagePref = val ? CagePreference.companyProvides : CagePreference.clientProvides;
                        });
                      },
                    ),
                    const Divider(),
                    DropdownButtonFormField<ClimatePreference>(
                      value: _climatePref,
                      decoration: const InputDecoration(labelText: 'Araç İçi İklimlendirme Tercihi'),
                      items: const [
                        DropdownMenuItem(value: ClimatePreference.coolAc, child: Text('Serin / Klima Açık (21-22°C)')),
                        DropdownMenuItem(value: ClimatePreference.standard, child: Text('Normal Oda Sıcaklığı (24°C)')),
                        DropdownMenuItem(value: ClimatePreference.warm, child: Text('Ilık / Kuş ve Egzotikler İçin')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _climatePref = val);
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _breakInterval,
                      decoration: const InputDecoration(labelText: 'Beslenme & Tuvalet Mola Takvimi'),
                      items: const [
                        DropdownMenuItem(value: '1.5 Saatte Bir', child: Text('Her 1.5 saatte bir mola & su')),
                        DropdownMenuItem(value: '2 Saatte Bir', child: Text('Her 2 saatte bir mola & kontrol')),
                        DropdownMenuItem(value: '3 Saatte Bir', child: Text('Her 3 saatte bir (Kısa rotalar)')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _breakInterval = val);
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 4. Refakatçi & Güzergah
            _buildSectionHeader('4. Rota ve Refakatçi', Icons.person_pin_circle_rounded),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  children: [
                    TextFormField(
                      controller: _pickupAddressController,
                      decoration: const InputDecoration(
                        labelText: 'Alınış Adresi',
                        prefixIcon: Icon(Icons.my_location_rounded, color: AppTheme.primaryTeal),
                      ),
                      onChanged: (_) => _recalculatePrice(),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _dropoffAddressController,
                      decoration: const InputDecoration(
                        labelText: 'Teslim Adresi',
                        prefixIcon: Icon(Icons.location_on_rounded, color: Colors.redAccent),
                      ),
                      onChanged: (_) => _recalculatePrice(),
                    ),
                    const SizedBox(height: 12),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Araçta Refakatçi (Pet Sahibi) Olacak mı?'),
                      subtitle: Text(
                        isCityIn 
                          ? 'İzmir şehir içi nakillerde refakatçi ÜCRETSİZDİR.'
                          : 'Şehirlerarası nakillerde km başına ek refakatçi tarifesi yansıtılır.',
                        style: TextStyle(
                          color: isCityIn ? AppTheme.successGreen : AppTheme.textMuted,
                          fontSize: 12,
                        ),
                      ),
                      value: _hasCompanion,
                      activeColor: AppTheme.primaryTeal,
                      onChanged: (val) {
                        setState(() => _hasCompanion = val);
                        _recalculatePrice();
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // 5. Fiyat Özeti & Onay Kartı
            _buildPriceSummaryCard(),
            const SizedBox(height: 24),

            // Rezervasyon Butonu
            ElevatedButton(
              onPressed: () {
                // Rezervasyon Başarılı -> Canlı Takip Ekranına Git
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => TrackingScreen(
                      booking: BookingItemModel(
                        id: 'demo_101',
                        bookingCode: 'ARYA-2026-8842',
                        pet: PetModel(
                          id: 'p1',
                          name: _nameController.text,
                          type: _petType,
                          breed: 'Kangal / Melez',
                          weightKg: double.tryParse(_weightController.text) ?? 15,
                        ),
                        serviceType: _serviceType,
                        origin: LocationPointModel(
                          title: 'Kalkış',
                          address: _pickupAddressController.text,
                          latitude: 38.4550,
                          longitude: 27.1080,
                        ),
                        destination: LocationPointModel(
                          title: 'Varış',
                          address: _dropoffAddressController.text,
                          latitude: 38.4350,
                          longitude: 27.1420,
                        ),
                        pickupDateTime: _selectedDate,
                        hasCompanion: _hasCompanion,
                        breakInterval: _breakInterval,
                        totalPrice: _priceEstimate?.totalPrice ?? 1375,
                        status: 'ONAYLANDI',
                        whatsappTrackingUrl: 'https://chat.whatsapp.com/sample-live-location',
                      ),
                    ),
                  ),
                );
              },
              child: const Text('🐾 Rezervasyonu Tamamla'),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.primaryTeal),
          const SizedBox(width: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceTypeButton({
    required String title,
    required String subtitle,
    required ServiceType type,
    required bool selected,
  }) {
    return InkWell(
      onTap: () {
        setState(() => _serviceType = type);
        _recalculatePrice();
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryTeal.withOpacity(0.08) : Colors.white,
          border: Border.all(
            color: selected ? AppTheme.primaryTeal : const Color(0xFFE2E8F0),
            width: selected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: selected ? AppTheme.primaryTeal : AppTheme.textDark,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceSummaryCard() {
    return Card(
      color: const Color(0xFFF0FDF4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFBBF7D0)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tahmini Toplam Ücret', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                if (_isLoadingPrice)
                  const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                else
                  Text(
                    '${_priceEstimate?.totalPrice.toStringAsFixed(0)} TL',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.primaryTeal,
                    ),
                  ),
              ],
            ),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _serviceType == ServiceType.cityIn ? 'İzmir Şehir İçi Başlangıç:' : 'Mesafe Hesabı:',
                  style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                ),
                Text(
                  _serviceType == ServiceType.cityIn ? '1.000 TL' : '${_priceEstimate?.distanceKm.toStringAsFixed(0)} km',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Refakatçi Durumu:', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                Text(
                  _hasCompanion 
                    ? (_serviceType == ServiceType.cityIn ? 'Var (Ücretsiz)' : '+${_priceEstimate?.companionFee.toStringAsFixed(0)} TL') 
                    : 'Yok',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
