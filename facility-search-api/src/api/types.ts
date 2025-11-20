/**
 * Facility and related data models
 */

export interface Facility {
  id: string;
  name: string;
  address1: string;
  address2: string | null;
  suburb: string;
  state: string;
  postCode: string;
  country: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacilityAmenity {
  facilityId: string;
  amenity: string;
}

export interface FacilityWithAmenities extends Facility {
  amenities: string[];
}

export interface SearchParams {
  keywords?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers, default 5
  amenities?: string[];
  limit?: number; // default 20
  offset?: number; // default 0
}

export interface SearchResult {
  facilities: FacilityWithAmenities[];
  total: number;
  limit: number;
  offset: number;
}

export interface FacilityWithDistance extends FacilityWithAmenities {
  distance?: number; // in kilometers
}

