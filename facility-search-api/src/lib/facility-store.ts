/**
 * In-memory data store for facilities
 * Loads normalized fixture data that mimics database structure
 * 
 * TODO: PRODUCTION - Replace this entire file with database connection
 * In production, remove this file and use a proper database client:
 * - PostgreSQL with pg or Prisma
 * - Connection pooling
 * - Prepared statements
 * - Transaction support
 */

import facilitiesFixture from '../fixtures/facilities.json' with { type: 'json' };
import amenitiesFixture from '../fixtures/facility-amenities.json' with { type: 'json' };
import type { Facility, FacilityAmenity, FacilityWithAmenities } from '../api/types.js';

/**
 * Singleton data store for facilities
 * Provides in-memory access to parsed facility data
 */
export class FacilityStore {
  private static instance: FacilityStore;
  private facilities: Map<string, Facility>;
  private amenities: Map<string, FacilityAmenity[]>;
  private amenityIndex: Map<string, Set<string>>; // amenity -> Set of facility IDs

  private constructor() {
    this.facilities = new Map();
    this.amenities = new Map();
    this.amenityIndex = new Map();
    this.loadData();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): FacilityStore {
    if (!FacilityStore.instance) {
      FacilityStore.instance = new FacilityStore();
    }
    return FacilityStore.instance;
  }

  /**
   * Load fixture data that mimics database structure
   * 
   * TODO: PRODUCTION - Remove this method when using real database
   * This loads JSON fixtures into memory. In production, data will be
   * queried directly from PostgreSQL via the repository layer.
   */
  private loadData(): void {
    // TODO: PRODUCTION - Replace with database seed script
    // Load facilities (mimics facilities table)
    const facilities = facilitiesFixture as Array<Omit<Facility, 'createdAt' | 'updatedAt'> & {
      createdAt: string;
      updatedAt: string;
    }>;

    facilities.forEach((raw) => {
      const facility: Facility = {
        ...raw,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
      };

      this.facilities.set(facility.id, facility);
    });

    // TODO: PRODUCTION - Replace with database seed script
    // Load amenities (mimics facility_amenities table)
    const amenities = amenitiesFixture as FacilityAmenity[];

    // Group amenities by facility ID
    const amenitiesByFacility = new Map<string, FacilityAmenity[]>();
    amenities.forEach((amenity) => {
      if (!amenitiesByFacility.has(amenity.facilityId)) {
        amenitiesByFacility.set(amenity.facilityId, []);
      }
      amenitiesByFacility.get(amenity.facilityId)!.push(amenity);

      // Build amenity index for fast lookup
      if (!this.amenityIndex.has(amenity.amenity)) {
        this.amenityIndex.set(amenity.amenity, new Set());
      }
      this.amenityIndex.get(amenity.amenity)!.add(amenity.facilityId);
    });

    this.amenities = amenitiesByFacility;
  }

  /**
   * Get all facilities
   */
  public getAllFacilities(): Facility[] {
    return Array.from(this.facilities.values());
  }

  /**
   * Get facility by ID
   */
  public getFacilityById(id: string): Facility | undefined {
    return this.facilities.get(id);
  }

  /**
   * Get amenities for a facility
   */
  public getAmenitiesByFacilityId(facilityId: string): string[] {
    const amenities = this.amenities.get(facilityId);
    return amenities ? amenities.map((a) => a.amenity) : [];
  }

  /**
   * Get facility with amenities
   */
  public getFacilityWithAmenities(id: string): FacilityWithAmenities | undefined {
    const facility = this.facilities.get(id);
    if (!facility) return undefined;

    return {
      ...facility,
      amenities: this.getAmenitiesByFacilityId(id),
    };
  }

  /**
   * Get all facilities with amenities
   */
  public getAllFacilitiesWithAmenities(): FacilityWithAmenities[] {
    return Array.from(this.facilities.values()).map((facility) => ({
      ...facility,
      amenities: this.getAmenitiesByFacilityId(facility.id),
    }));
  }

  /**
   * Get facility IDs that have specific amenity
   */
  public getFacilityIdsByAmenity(amenity: string): string[] {
    const ids = this.amenityIndex.get(amenity);
    return ids ? Array.from(ids) : [];
  }

  /**
   * Get all unique amenities
   */
  public getAllUniqueAmenities(): string[] {
    return Array.from(this.amenityIndex.keys()).sort();
  }

  /**
   * Get total count of facilities
   */
  public getCount(): number {
    return this.facilities.size;
  }
}

