import { describe, it, expect, beforeAll } from 'vitest';
import { FacilityStore } from './facility-store';

describe('FacilityStore', () => {
  let store: FacilityStore;

  beforeAll(() => {
    store = FacilityStore.getInstance();
  });

  it('should be a singleton', () => {
    const store1 = FacilityStore.getInstance();
    const store2 = FacilityStore.getInstance();
    expect(store1).toBe(store2);
  });

  it('should load facilities from JSON', () => {
    const count = store.getCount();
    expect(count).toBeGreaterThan(0);
  });

  it('should get facility by ID', () => {
    const facility = store.getFacilityById('facility-001');
    expect(facility).toBeDefined();
    expect(facility?.name).toBe('City Fitness Central');
    expect(facility?.suburb).toBe('Sydney');
    expect(facility?.state).toBe('NSW');
    expect(facility?.postCode).toBe('2000');
  });

  it('should return undefined for non-existent facility', () => {
    const facility = store.getFacilityById('non-existent-id');
    expect(facility).toBeUndefined();
  });

  it('should get amenities for a facility', () => {
    const amenities = store.getAmenitiesByFacilityId('facility-001');
    expect(amenities).toContain('pool');
    expect(amenities).toContain('sauna');
    expect(amenities.length).toBeGreaterThan(0);
  });

  it('should get facility with amenities', () => {
    const facility = store.getFacilityWithAmenities('facility-001');
    expect(facility).toBeDefined();
    expect(facility?.amenities).toContain('pool');
    expect(facility?.name).toBe('City Fitness Central');
  });

  it('should get all facilities with amenities', () => {
    const facilities = store.getAllFacilitiesWithAmenities();
    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities[0]).toHaveProperty('amenities');
    expect(Array.isArray(facilities[0].amenities)).toBe(true);
  });

  it('should get facility IDs by amenity', () => {
    const facilityIds = store.getFacilityIdsByAmenity('pool');
    expect(facilityIds.length).toBeGreaterThan(0);
    expect(facilityIds).toContain('facility-001');
  });

  it('should get all unique amenities', () => {
    const amenities = store.getAllUniqueAmenities();
    expect(amenities.length).toBeGreaterThan(0);
    expect(amenities).toContain('pool');
    expect(amenities).toContain('sauna');
    // Should be sorted
    const sorted = [...amenities].sort();
    expect(amenities).toEqual(sorted);
  });

  it('should parse address components correctly', () => {
    const facility = store.getFacilityById('facility-001');
    expect(facility?.address1).toBe('123 Market St');
    expect(facility?.suburb).toBe('Sydney');
    expect(facility?.state).toBe('NSW');
    expect(facility?.postCode).toBe('2000');
    expect(facility?.country).toBe('Australia');
  });

  it('should have latitude and longitude', () => {
    const facility = store.getFacilityById('facility-001');
    expect(facility?.latitude).toBeDefined();
    expect(facility?.longitude).toBeDefined();
    expect(typeof facility?.latitude).toBe('number');
    expect(typeof facility?.longitude).toBe('number');
  });

  it('should have createdAt and updatedAt timestamps', () => {
    const facility = store.getFacilityById('facility-001');
    expect(facility?.createdAt).toBeInstanceOf(Date);
    expect(facility?.updatedAt).toBeInstanceOf(Date);
  });
});

