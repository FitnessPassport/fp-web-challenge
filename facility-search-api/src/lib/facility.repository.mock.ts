/**
 * Mock implementation of facility repository using in-memory data store
 * 
 * TODO: PRODUCTION - Replace this with FacilityPostgresRepository
 * Create a new file: facility-postgres.repository.ts that implements IFacilityRepository
 * 
 * Example production implementation:
 * 
 * import { Pool } from 'pg';
 * 
 * export class FacilityPostgresRepository implements IFacilityRepository {
 *   constructor(private db: Pool) {}
 *   
 *   async findById(id: string): Promise<FacilityWithAmenities | null> {
 *     const result = await this.db.query(`
 *       SELECT f.*, array_agg(fa.amenity) as amenities
 *       FROM facilities f
 *       LEFT JOIN facility_amenities fa ON f.id = fa.facility_id
 *       WHERE f.id = $1
 *       GROUP BY f.id
 *     `, [id]);
 *     return result.rows[0] || null;
 *   }
 *   
 *   async search(params: SearchParams): Promise<FacilityWithAmenities[]> {
 *     // Use PostGIS for geospatial queries
 *     // Use pg_trgm for fuzzy text search
 *     // Use proper indexes for performance
 *   }
 * }
 */

import { FacilityStore } from './facility-store.js';
import type {
  FacilityWithAmenities,
  SearchParams,
} from '../api/types.js';
import type { IFacilityRepository } from './facility.repository.js';

export class FacilityMockRepository implements IFacilityRepository {
  private store: FacilityStore;

  constructor() {
    // TODO: PRODUCTION - Replace with database connection pool
    // constructor(private db: Pool) {}
    this.store = FacilityStore.getInstance();
  }

  /**
   * Find facility by ID
   * 
   * TODO: PRODUCTION - Replace with SQL query:
   * SELECT f.*, array_agg(fa.amenity) as amenities
   * FROM facilities f
   * LEFT JOIN facility_amenities fa ON f.id = fa.facility_id
   * WHERE f.id = $1
   * GROUP BY f.id
   */
  async findById(id: string): Promise<FacilityWithAmenities | null> {
    const facility = this.store.getFacilityWithAmenities(id);
    return facility || null;
  }

  /**
   * Search facilities with filters
   * 
   * TODO: PRODUCTION - Replace with optimized PostgreSQL query:
   * 
   * SELECT DISTINCT f.*, array_agg(fa.amenity) as amenities,
   *   ST_Distance(
   *     f.location,
   *     ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography
   *   ) / 1000 as distance_km
   * FROM facilities f
   * LEFT JOIN facility_amenities fa ON f.id = fa.facility_id
   * WHERE 
   *   ($keywords IS NULL OR f.name ILIKE '%' || $keywords || '%')
   *   AND ($latitude IS NULL OR ST_DWithin(
   *     f.location,
   *     ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography,
   *     $radiusMeters
   *   ))
   *   AND ($amenities IS NULL OR fa.amenity = ANY($amenities))
   * GROUP BY f.id
   * ORDER BY distance_km ASC
   * LIMIT $limit OFFSET $offset
   * 
   * Required indexes:
   * - CREATE INDEX idx_name_trgm ON facilities USING gin (name gin_trgm_ops);
   * - CREATE INDEX idx_location_gist ON facilities USING GIST(location);
   * - CREATE INDEX idx_amenity ON facility_amenities(amenity);
   */
  async search(params: SearchParams): Promise<FacilityWithAmenities[]> {
    let results = this.store.getAllFacilitiesWithAmenities();

    // Filter by keywords (case-insensitive partial match)
    if (params.keywords) {
      const searchTerm = params.keywords.toLowerCase().trim();
      results = results.filter((facility) =>
        facility.name.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by amenities (facility must have ALL specified amenities, case-insensitive)
    if (params.amenities && params.amenities.length > 0) {
      results = results.filter((facility) =>
        params.amenities!.every((amenity) => 
          facility.amenities.includes(amenity.toLowerCase())
        ),
      );
    }

    // Filter by location (within radius)
    if (params.latitude !== undefined && params.longitude !== undefined) {
      const radius = params.radius || 5; // default 5km
      results = results.filter((facility) => {
        const distance = this.calculateDistance(
          params.latitude!,
          params.longitude!,
          facility.latitude,
          facility.longitude,
        );
        return distance <= radius;
      });
    }

    return results;
  }

  /**
   * Get all facilities
   */
  async findAll(): Promise<FacilityWithAmenities[]> {
    return this.store.getAllFacilitiesWithAmenities();
  }

  /**
   * Get total count of facilities
   */
  async count(): Promise<number> {
    return this.store.getCount();
  }

  /**
   * Get all unique amenities
   */
  async getAllAmenities(): Promise<string[]> {
    return this.store.getAllUniqueAmenities();
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

