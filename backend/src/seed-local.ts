import { isLocalDb } from './config/firebase';
import { BookingService } from './services/bookingService';

// Yerel mock veritabanına dashboard'u denemek için örnek rezervasyonlar ekler.
async function seed() {
  if (!isLocalDb) {
    console.error('Seed yalnızca yerel mock modunda çalışır (gerçek Firestore\'a yazmamak için).');
    process.exit(1);
  }
  if ((await BookingService.getBookings()).length > 0) {
    console.log('Veritabanında zaten rezervasyon var, seed atlandı.');
    return;
  }

  const common = { userId: 'demo-user', pickupDateTime: new Date(Date.now() + 86400000).toISOString() };

  const luna = await BookingService.createBooking({
    ...common,
    customerName: 'Selin Yılmaz',
    customerPhone: '+905321112233',
    pet: { id: 'p1', userId: 'demo-user', name: 'Luna', type: 'DOG', breed: 'Golden', weightKg: 24, sizeCategory: 'MEDIUM', hasHealthNotes: false, isVaccinated: true, cagePreference: 'COMPANY_PROVIDES', climatePreference: 'COOL_AC', createdAt: '', updatedAt: '' },
    serviceType: 'CITY_IN',
    origin: { address: 'Karşıyaka Çarşı, İzmir', latitude: 38.4595, longitude: 27.11 },
    destination: { address: 'Alsancak Kordon, İzmir', latitude: 38.435, longitude: 27.145 },
    hasCompanion: true
  });
  await BookingService.updateBookingStatus(luna.id, 'IN_TRANSIT');
  await BookingService.attachWhatsAppTracking(luna.id, 'https://wa.me/905321112233?text=CanliKonum');

  await BookingService.createBooking({
    ...common,
    customerName: 'Caner Akın',
    customerPhone: '+905443334455',
    pet: { id: 'p2', userId: 'demo-user', name: 'Şila', type: 'DOG', breed: 'Terrier', weightKg: 6, sizeCategory: 'SMALL', hasHealthNotes: false, isVaccinated: true, cagePreference: 'CLIENT_PROVIDES', climatePreference: 'STANDARD', createdAt: '', updatedAt: '' },
    serviceType: 'CITY_IN',
    origin: { address: 'Çiğli Atatürk Mah., İzmir', latitude: 38.495, longitude: 27.06 },
    destination: { address: 'Balçova Teleferik, İzmir', latitude: 38.385, longitude: 27.045 },
    hasCompanion: false
  });

  const misty = await BookingService.createBooking({
    ...common,
    customerName: 'Burak Demir',
    customerPhone: '+905553334455',
    pet: { id: 'p3', userId: 'demo-user', name: 'Mırmır', type: 'CAT', breed: 'British', weightKg: 4.5, sizeCategory: 'SMALL', hasHealthNotes: false, isVaccinated: true, cagePreference: 'COMPANY_PROVIDES', climatePreference: 'STANDARD', createdAt: '', updatedAt: '' },
    serviceType: 'CITY_OUT',
    origin: { address: 'Bornova, İzmir', latitude: 38.46, longitude: 27.22 },
    destination: { address: 'Kadıköy, İstanbul', latitude: 40.99, longitude: 29.025 },
    hasCompanion: true
  });
  await BookingService.updateBookingStatus(misty.id, 'CONFIRMED');

  console.log('3 örnek rezervasyon eklendi.');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
