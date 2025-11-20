/**
 * Repository interface for facility data access
 * Abstracts data source implementation (mock, database, etc.)
 */

import type {
  FacilityWithAmenities,
  SearchParams,
} from '../api/types.js';

export interface IFacilityRepository {
  /**
   * Find facility by ID
   */
  findById(id: string): Promise<FacilityWithAmenities | null>;

  /**
   * Search facilities with filters
   */
  search(params: SearchParams): Promise<FacilityWithAmenities[]>;

  /**
   * Get all facilities
   */
  findAll(): Promise<FacilityWithAmenities[]>;

  /**
   * Get total count of facilities
   */
  count(): Promise<number>;

  /**
   * Get all unique amenities
   */
  getAllAmenities(): Promise<string[]>;
}

