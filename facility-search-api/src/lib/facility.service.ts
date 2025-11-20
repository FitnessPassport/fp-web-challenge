/**
 * Facility service - Business logic layer
 */

import type { IFacilityRepository } from './facility.repository.js';
import type {
  FacilityWithAmenities,
  SearchParams,
  SearchResult,
} from '../api/types.js';
import { NotFoundError, appConfig } from '../config.js';

export class FacilityService {
  constructor(private repository: IFacilityRepository) {}

  /**
   * Search facilities with filters and pagination
   */
  async searchFacilities(params: SearchParams): Promise<SearchResult> {
    // Apply defaults
    const limit = params.limit || appConfig.defaultLimit;
    const offset = params.offset || 0;
    const radius = params.radius || appConfig.defaultRadius;

    // Search with repository
    const allResults = await this.repository.search({
      ...params,
      radius,
    });

    // Apply pagination
    const paginatedResults = allResults.slice(offset, offset + limit);

    return {
      facilities: paginatedResults,
      total: allResults.length,
      limit,
      offset,
    };
  }

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<FacilityWithAmenities> {
    const facility = await this.repository.findById(id);

    if (!facility) {
      throw new NotFoundError(`Facility with id '${id}' not found`);
    }

    return facility;
  }

  /**
   * Get all unique amenities
   */
  async getAllAmenities(): Promise<string[]> {
    return this.repository.getAllAmenities();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; facilityCount: number }> {
    const count = await this.repository.count();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      facilityCount: count,
    };
  }
}

