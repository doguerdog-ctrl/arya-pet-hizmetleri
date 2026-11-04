import { PricingService } from './services/pricingService';

async function runSimulation() {
  console.log('--- 🐾 ARYA PET NAKİL FİYATLANDIRMA SİMÜLASYONU ---');

  // Senaryo 1: İzmir Şehir İçi (Örn: Karşıyaka -> Alsancak, 15 km, 25 kg Golden Retriever, refakatçi var)
  const cityInEstimate = await PricingService.calculatePrice({
    serviceType: 'CITY_IN',
    distanceKm: 15,
    durationMinutes: 30,
    petWeightKg: 25,
    hasCompanion: true
  });
  console.log('\n[Senaryo 1: İzmir Şehir İçi (15 km)]');
  console.log(cityInEstimate);

  // Senaryo 2: Şehirlerarası (Örn: İzmir -> İstanbul, 480 km, Küçük Kedi 4 kg, Refakatçi yok)
  const cityOutSmall = await PricingService.calculatePrice({
    serviceType: 'CITY_OUT',
    distanceKm: 480,
    durationMinutes: 300,
    petWeightKg: 4,
    hasCompanion: false
  });
  console.log('\n[Senaryo 2: Şehirlerarası (İzmir -> İstanbul, Küçük Kedi)]');
  console.log(cityOutSmall);

  // Senaryo 3: Şehirlerarası (Örn: İzmir -> Ankara, 580 km, Dev Köpek 50 kg, Refakatçi VAR)
  const cityOutGiantWithCompanion = await PricingService.calculatePrice({
    serviceType: 'CITY_OUT',
    distanceKm: 580,
    durationMinutes: 400,
    petWeightKg: 50,
    hasCompanion: true
  });
  console.log('\n[Senaryo 3: Şehirlerarası (İzmir -> Ankara, Dev Köpek + Refakatçi)]');
  console.log(cityOutGiantWithCompanion);
}

runSimulation();
