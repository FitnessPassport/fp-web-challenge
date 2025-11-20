/**
 * Repository factory
 * Central place to instantiate repositories
 * 
 * TODO: PRODUCTION - This is where you swap mock for real database
 * Change the implementation here and it propagates throughout the app
 */

import { FacilityMockRepository } from './facility.repository.mock.js';
import type { IFacilityRepository } from './facility.repository.js';

/**
 * Create facility repository instance
 * 
 * TODO: PRODUCTION - Replace with database implementation:
 * 
 * import { pool } from '../config/database.config.js';
 * import { FacilityPostgresRepository } from './facility-postgres.repository.js';
 * 
 * export function createFacilityRepository(): IFacilityRepository {
 *   if (process.env.USE_MOCK_DATA === 'true') {
 *     return new FacilityMockRepository();
 *   }
 *   return new FacilityPostgresRepository(pool);
 * }
 */
export function createFacilityRepository(): IFacilityRepository {
  // For now, always return mock repository
  return new FacilityMockRepository();
}

