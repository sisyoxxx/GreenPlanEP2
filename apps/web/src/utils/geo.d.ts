/**
 * Calculate the great-circle distance between two points on the earth using the Haversine formula.
 */
export declare function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
export interface CityCoord {
    name: string;
    lat: number;
    lon: number;
}
export declare const CITY_COORDS: CityCoord[];
export declare function findNearestCity(latitude: number, longitude: number, cities?: CityCoord[]): string;
