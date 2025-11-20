import { describe, it, expect, beforeEach } from 'vitest';
import { FacilityMockRepository } from './facility.repository.mock';

describe('FacilityMockRepository', () => {
  let repository: FacilityMockRepository;

  beforeEach(() => {
    repository = new FacilityMockRepository();
  });

  describe('findById', () => {
    it('should find facility by ID', async () => {
      const facility = await repository.findById('facility-001');
      expect(facility).toBeDefined();
      expect(facility?.name).toBe('City Fitness Central');
      expect(facility?.amenities).toContain('pool');
    });

    it('should return null for non-existent ID', async () => {
      const facility = await repository.findById('non-existent');
      expect(facility).toBeNull();
    });
  });

  describe('search', () => {
    it('should search by keywords', async () => {
      const results = await repository.search({ keywords: 'City' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((f) => f.name.toLowerCase().includes('city'))).toBe(true);
    });

    it('should search case-insensitively', async () => {
      const results = await repository.search({ keywords: 'city' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by amenities', async () => {
      const results = await repository.search({ amenities: ['Pool'] });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((f) => f.amenities.includes('pool'))).toBe(true);
    });

    it('should search by multiple amenities (AND logic)', async () => {
      const results = await repository.search({ amenities: ['Pool', 'Sauna'] });
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((f) => f.amenities.includes('pool') && f.amenities.includes('sauna')),
      ).toBe(true);
    });

    it('should search by location within radius', async () => {
      // Sydney CBD coordinates
      const results = await repository.search({
        latitude: -33.8688,
        longitude: 151.2093,
        radius: 5, // 5km radius
      });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should use default radius of 5km when not specified', async () => {
      const results = await repository.search({
        latitude: -33.8688,
        longitude: 151.2093,
      });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should combine multiple search filters', async () => {
      const results = await repository.search({
        keywords: 'Fitness',
        amenities: ['Pool'],
        latitude: -33.8688,
        longitude: 151.2093,
        radius: 10,
      });
      // Should have results that match all criteria
      expect(
        results.every(
          (f) => f.name.toLowerCase().includes('fitness') && f.amenities.includes('pool'),
        ),
      ).toBe(true);
    });

    it('should return empty array when no matches found', async () => {
      const results = await repository.search({
        keywords: 'NonExistentFacilityName12345',
      });
      expect(results).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all facilities with amenities', async () => {
      const facilities = await repository.findAll();
      expect(facilities.length).toBeGreaterThan(0);
      expect(facilities[0]).toHaveProperty('amenities');
      expect(Array.isArray(facilities[0].amenities)).toBe(true);
    });
  });

  describe('count', () => {
    it('should return total count of facilities', async () => {
      const count = await repository.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('getAllAmenities', () => {
    it('should return all unique amenities', async () => {
      const amenities = await repository.getAllAmenities();
      expect(amenities.length).toBeGreaterThan(0);
      expect(amenities).toContain('pool');
      // Should be sorted
      const sorted = [...amenities].sort();
      expect(amenities).toEqual(sorted);
    });
  });
});

