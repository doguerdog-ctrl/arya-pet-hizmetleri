import 'package:flutter/material.dart';
import '../models/pet_and_booking.dart';
import '../theme/app_theme.dart';

class MyPetsScreen extends StatefulWidget {
  const MyPetsScreen({Key? key}) : super(key: key);

  @override
  State<MyPetsScreen> createState() => _MyPetsScreenState();
}

class _MyPetsScreenState extends State<MyPetsScreen> {
  final List<PetModel> _pets = [
    PetModel(
      id: 'pet_1',
      name: 'Luna',
      type: PetType.dog,
      breed: 'Golden Retriever',
      weightKg: 24.5,
      healthNotes: 'Araç tutması yok, aşı karnesi tam, çipli.',
      cagePref: CagePreference.companyProvides,
      climatePref: ClimatePreference.coolAc,
    ),
    PetModel(
      id: 'pet_2',
      name: 'Mırmır',
      type: PetType.cat,
      breed: 'British Shorthair',
      weightKg: 4.8,
      healthNotes: 'Yolculukta sakinleştirici gerekmez, kendi boxında seyahat eder.',
      cagePref: CagePreference.clientProvides,
      climatePref: ClimatePreference.standard,
    ),
  ];

  void _showAddPetDialog() {
    final nameCtrl = TextEditingController();
    final breedCtrl = TextEditingController();
    final weightCtrl = TextEditingController();
    PetType selectedType = PetType.dog;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            left: 20,
            right: 20,
            top: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Yeni Pati Ekle 🐾',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<PetType>(
                value: selectedType,
                decoration: const InputDecoration(labelText: 'Pati Türü'),
                items: const [
                  DropdownMenuItem(value: PetType.dog, child: Text('Köpek 🐶')),
                  DropdownMenuItem(value: PetType.cat, child: Text('Kedi 🐱')),
                  DropdownMenuItem(value: PetType.bird, child: Text('Kuş 🦜')),
                  DropdownMenuItem(value: PetType.exotic, child: Text('Egzotik 🦎')),
                ],
                onChanged: (val) {
                  if (val != null) setModalState(() => selectedType = val);
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: nameCtrl,
                decoration: const InputDecoration(labelText: 'İsim (örn: Maya)'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: breedCtrl,
                      decoration: const InputDecoration(labelText: 'Irk (örn: Terrier)'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: weightCtrl,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Kilo (kg)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  if (nameCtrl.text.isNotEmpty) {
                    setState(() {
                      _pets.add(PetModel(
                        id: 'pet_${DateTime.now().millisecondsSinceEpoch}',
                        name: nameCtrl.text,
                        type: selectedType,
                        breed: breedCtrl.text.isEmpty ? 'Karma' : breedCtrl.text,
                        weightKg: double.tryParse(weightCtrl.text) ?? 5.0,
                      ));
                    });
                    Navigator.pop(ctx);
                  }
                },
                child: const Text('Kaydet ve Profile Ekle'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kayıtlı Patilerim'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.primaryTeal),
            onPressed: _showAddPetDialog,
          ),
        ],
      ),
      body: _pets.isEmpty
          ? const Center(child: Text('Henüz kayıtlı evcil hayvanınız yok.'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _pets.length,
              itemBuilder: (context, index) {
                final pet = _pets[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 26,
                              backgroundColor: AppTheme.primaryTeal.withOpacity(0.12),
                              child: Text(
                                pet.type == PetType.dog ? '🐶' : (pet.type == PetType.cat ? '🐱' : '🦜'),
                                style: const TextStyle(fontSize: 26),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    pet.name,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.textDark,
                                    ),
                                  ),
                                  Text(
                                    '${pet.breed} • ${pet.weightKg} kg',
                                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFDCFCE7),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'Aşıları Tam ✅',
                                style: TextStyle(color: Color(0xFF15803D), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Sağlık Notu: ${pet.healthNotes.isEmpty ? "Belirtilmemiş" : pet.healthNotes}',
                              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                            ),
                            TextButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.edit_note_rounded, size: 18, color: AppTheme.primaryTeal),
                              label: const Text('Düzenle', style: TextStyle(color: AppTheme.primaryTeal, fontSize: 12)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
