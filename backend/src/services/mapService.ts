import { Client, TravelMode, TrafficModel } from '@googlemaps/google-maps-services-js';
import { LocationPoint } from '../types';

const mapsClient = new Client({});

export interface MultiStopRouteResult {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalDurationInTrafficMinutes?: number;
  tollRoadsUsed: boolean;
  legs: Array<{
    startAddress: string;
    endAddress: string;
    distanceKm: number;
    durationMinutes: number;
  }>;
}

export class MapService {
  /**
   * Google Maps Directions API:
   * - ÜCRETLİ OTOYOLLAR SERBEST & ÖNCELİKLİ (O-5 İzmir-İstanbul Otoyolu, Osmangazi Köprüsü, İzmir O-30 Çevre Yolu)
   * - FERİBOTLAR KESİNLİKLE HARİÇ (avoid: ['ferries'])
   */
  public static async calculateRoute(
    origin: LocationPoint,
    destination: LocationPoint
  ): Promise<{ distanceKm: number; durationMinutes: number }> {
    const multi = await this.calculateMultiStopRoute(origin, destination, []);
    return {
      distanceKm: multi.totalDistanceKm,
      durationMinutes: multi.totalDurationMinutes
    };
  }

  public static async calculateMultiStopRoute(
    origin: LocationPoint,
    destination: LocationPoint,
    stops: LocationPoint[] = []
  ): Promise<MultiStopRouteResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY tanımlanmamış, otoyol öncelikli simülasyon hesabı kullanılıyor.');
      return this.fallbackOtoyolCalculation(origin, destination, stops);
    }

    try {
      const waypoints = stops.map(stop => ({
        location: `${stop.latitude},${stop.longitude}`,
        stopover: true
      }));

      // Ücretli yollar kısıtlanmaz (avoidTolls YOK), yalnızca deniz/feribot hariç tutulur
      const response = await mapsClient.directions({
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          waypoints: waypoints.length > 0 ? (waypoints as any) : undefined,
          mode: TravelMode.driving,
          departure_time: new Date(),
          avoid: ['ferries' as any], // Feribotlar hariç, Otoyol ve Köprüler DAHİL
          key: apiKey
        }
      });

      const route = response.data.routes[0];
      if (route && route.legs) {
        let totalMeters = 0;
        let totalSeconds = 0;
        let totalTrafficSeconds = 0;
        const legs = [];

        for (const leg of route.legs) {
          totalMeters += leg.distance.value;
          totalSeconds += leg.duration.value;
          totalTrafficSeconds += leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value;

          legs.push({
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            distanceKm: Number((leg.distance.value / 1000).toFixed(1)),
            durationMinutes: Math.round(leg.duration.value / 60)
          });
        }

        return {
          totalDistanceKm: Number((totalMeters / 1000).toFixed(1)),
          totalDurationMinutes: Math.round(totalSeconds / 60),
          totalDurationInTrafficMinutes: Math.round(totalTrafficSeconds / 60),
          tollRoadsUsed: true,
          legs
        };
      }
    } catch (error) {
      console.error('Google Maps Directions API hatası, otoyol fallback hesabına geçiliyor:', error);
    }

    return this.fallbackOtoyolCalculation(origin, destination, stops);
  }

  private static fallbackOtoyolCalculation(
    origin: LocationPoint,
    destination: LocationPoint,
    stops: LocationPoint[] = []
  ): MultiStopRouteResult {
    const allPoints = [origin, ...stops, destination];
    let totalKm = 0;
    const legs = [];

    for (let i = 0; i < allPoints.length - 1; i++) {
      const p1 = allPoints[i];
      const p2 = allPoints[i + 1];

      const dLat = (p2.latitude - p1.latitude) * (Math.PI / 180);
      const dLon = (p2.longitude - p1.longitude) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.latitude * (Math.PI / 180)) *
          Math.cos(p2.latitude * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const legStraightKm = 6371 * c;
      
      // Otoyol viraj faktörü (O-5 otoyolu standartları)
      const legRoadKm = Math.max(4.0, Number((legStraightKm * 1.25).toFixed(1)));

      totalKm += legRoadKm;
      legs.push({
        startAddress: p1.address || `Nokta ${i + 1}`,
        endAddress: p2.address || `Nokta ${i + 2}`,
        distanceKm: legRoadKm,
        durationMinutes: Math.round((legRoadKm / 90) * 60) // Otoyol ortalama 90-100 km/s seyir
      });
    }

    return {
      totalDistanceKm: Number(totalKm.toFixed(1)),
      totalDurationMinutes: Math.round((totalKm / 85) * 60),
      totalDurationInTrafficMinutes: Math.round((totalKm / 85) * 60 * 1.1),
      tollRoadsUsed: true,
      legs
    };
  }
}
