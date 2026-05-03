const EARTH_RADIUS_KM = 6371

/**
 * Calculate the great-circle distance between two points on the earth using the Haversine formula.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export interface CityCoord {
  name: string
  lat: number
  lon: number
}

export const CITY_COORDS: CityCoord[] = [
  { name: '北京', lat: 39.9042, lon: 116.4074 },
  { name: '上海', lat: 31.2304, lon: 121.4737 },
  { name: '广州', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', lat: 22.5431, lon: 114.0579 },
  { name: '杭州', lat: 30.2741, lon: 120.1551 },
  { name: '成都', lat: 30.5728, lon: 104.0668 },
  { name: '武汉', lat: 30.5928, lon: 114.3055 },
  { name: '南京', lat: 32.0603, lon: 118.7969 },
  { name: '西安', lat: 34.3416, lon: 108.9398 },
  { name: '重庆', lat: 29.563, lon: 106.5516 },
]

export function findNearestCity(latitude: number, longitude: number, cities: CityCoord[] = CITY_COORDS): string {
  let closestCity = ''
  let minDistance = Number.POSITIVE_INFINITY

  for (const city of cities) {
    const distance = haversineDistance(latitude, longitude, city.lat, city.lon)
    if (distance < minDistance) {
      minDistance = distance
      closestCity = city.name
    }
  }

  return closestCity
}
