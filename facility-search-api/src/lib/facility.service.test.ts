import { describe, it, expect, beforeEach } from 'vitest';
import { FacilityService } from './facility.service';
import { FacilityMockRepository } from './facility.repository.mock';
import { NotFoundError } from '../config';

describe('FacilityService', () => {
  let service: FacilityService;
  let repository: FacilityMockRepository;

  beforeEach(() => {
    repository = new FacilityMockRepository();
    service = new FacilityService(repository);
  });

  describe('searchFacilities', () => {
    it('should return paginated search results', async () => {
      const result = await service.searchFacilities({
        keywords: 'Fitness',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('facilities');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('offset');
      expect(result.facilities.length).toBeLessThanOrEqual(10);
    });

    it('should apply default limit and offset', async () => {
      const result = await service.searchFacilities({});

      expect(result.limit).toBe(20); // default limit
      expect(result.offset).toBe(0); // default offset
    });

    it('should search by keywords', async () => {
      const result = await service.searchFacilities({
        keywords: 'City',
      });

      expect(result.facilities.length).toBeGreaterThan(0);
      expect(
        result.facilities.every((f) => f.name.toLowerCase().includes('city')),
      ).toBe(true);
    });

    it('should search by location', async () => {
      const result = await service.searchFacilities({
        latitude: -33.8688,
        longitude: 151.2093,
        radius: 5,
      });

      expect(result.facilities.length).toBeGreaterThan(0);
    });

    it('should search by amenities', async () => {
      const result = await service.searchFacilities({
        amenities: ['Pool'],
      });

      expect(result.facilities.length).toBeGreaterThan(0);
      expect(result.facilities.every((f) => f.amenities.includes('pool'))).toBe(true);
    });
  });

  describe('getFacilityById', () => {
    it('should return facility by ID', async () => {
      const facility = await service.getFacilityById('facility-001');

      expect(facility).toBeDefined();
      expect(facility.id).toBe('facility-001');
      expect(facility.name).toBe('City Fitness Central');
    });

    it('should throw NotFoundError for non-existent ID', async () => {
      await expect(service.getFacilityById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllAmenities', () => {
    it('should return all unique amenities', async () => {
      const amenities = await service.getAllAmenities();

      expect(amenities.length).toBeGreaterThan(0);
      expect(amenities).toContain('pool');
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const health = await service.healthCheck();

      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('timestamp');
      expect(health).toHaveProperty('facilityCount');
      expect(health.facilityCount).toBeGreaterThan(0);
    });
  });
});

