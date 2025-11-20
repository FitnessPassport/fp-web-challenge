# Facility Search API

A production-ready RESTful API for searching and filtering fitness facilities built with TypeScript, Express, and Vitest.

## Features

✅ **Search Facilities** - Partial name matching, location-based search, amenity filtering  
✅ **Get Facility Details** - Retrieve complete facility information by ID  
✅ **Health Check** - System status endpoint  
✅ **Authentication** - Secure endpoints with Bearer token authentication  
✅ **Validation** - Request validation using Zod schemas  
✅ **Error Handling** - Structured error responses with proper HTTP status codes  
✅ **API Documentation** - Interactive Swagger/OpenAPI documentation  
✅ **Testing** - Comprehensive unit tests with Vitest  
✅ **Pagination** - Built-in pagination support  
✅ **TypeScript** - Fully typed with strict mode enabled  

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Production

```bash
npm start
```

## API Documentation

### Interactive Swagger UI
Visit **http://localhost:3000/api-docs** for interactive API documentation where you can:
- View all endpoints and their parameters
- Test API calls directly from the browser
- See request/response examples
- Authenticate and try protected endpoints

#### Mock token
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoidXNlci0wMDEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwibWVtYmVyc2hpcFR5cGUiOiJwcmVtaXVtIiwibWVtYmVyU2luY2UiOiIyMDI0LTAxLTAxIn0sImV4cCI6MTc2MzUzMTgzODk0NX0=.mock-signature

### Base URL
```
http://localhost:3000/v1
```

### Endpoints

#### 1. Health Check (No Auth Required)
```http
GET /v1/facilities/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-19T04:11:23.173Z",
    "facilityCount": 100
  }
}
```

#### 2. Search Facilities (Auth Required)
```http
GET /v1/facilities
```

**Query Parameters:**
- `keywords` (string, optional) - Search by facility name (case-insensitive partial match)
- `latitude` (number, optional) - Location latitude (-90 to 90)
- `longitude` (number, optional) - Location longitude (-180 to 180)
- `radius` (number, optional, default: 5) - Search radius in kilometers (0.1 to 100)
- `amenities` (string[], optional) - Filter by amenities (**case-insensitive**, must have ALL specified)
- `limit` (number, optional, default: 20) - Results per page (1 to 100)
- `offset` (number, optional, default: 0) - Pagination offset

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/v1/facilities?keywords=Fitness&latitude=-33.8688&longitude=151.2093&radius=5&amenities=Pool&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "facilities": [
      {
        "id": "facility-001",
        "name": "City Fitness Central",
        "address1": "123 Market St",
        "address2": null,
        "suburb": "Sydney",
        "state": "NSW",
        "postCode": "2000",
        "country": "Australia",
        "latitude": -33.8703,
        "longitude": 151.208,
        "createdAt": "2025-11-19T03:38:58.928Z",
        "updatedAt": "2025-11-19T03:38:58.928Z",
        "amenities": ["pool", "sauna", "24/7 access", "yoga classes"]
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

#### 3. Get Facility by ID (Auth Required)
```http
GET /v1/facilities/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/v1/facilities/facility-001"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "facility-001",
    "name": "City Fitness Central",
    "address1": "123 Market St",
    "address2": null,
    "suburb": "Sydney",
    "state": "NSW",
    "postCode": "2000",
    "country": "Australia",
    "latitude": -33.8703,
    "longitude": 151.208,
    "createdAt": "2025-11-19T03:38:58.928Z",
    "updatedAt": "2025-11-19T03:38:58.928Z",
    "amenities": ["Pool", "Sauna", "24/7 Access", "Yoga Classes"]
  }
}
```

## Authentication

The API uses Bearer token authentication. To generate a test token:

```bash
node -e "
const user = { id: 'user-123', email: 'test@example.com', name: 'Test User', membershipType: 'premium', memberSince: '2024-01-15' };
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
const payload = Buffer.from(JSON.stringify({ user, exp: Date.now() + 3600000 })).toString('base64');
const token = header + '.' + payload + '.mock-signature';
console.log(token);
"
```

Use the generated token in the Authorization header:
```
Authorization: Bearer <generated-token>
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid request parameters
- `UNAUTHORIZED` (401) - Missing or invalid authentication token
- `NOT_FOUND` (404) - Resource not found
- `INTERNAL_SERVER_ERROR` (500) - Server error

## Project Structure

```
facility-search-api/
├── src/
│   ├── api/              # API Layer
│   │   ├── middleware.ts            # Auth, validation, error handling
│   │   ├── routes.ts                # All routes and controllers
│   │   ├── swagger.ts               # OpenAPI/Swagger configuration
│   │   └── types.ts                 # TypeScript interfaces
│   ├── lib/              # Business Logic
│   │   ├── facility.service.ts
│   │   ├── facility.service.test.ts
│   │   ├── facility.repository.ts
│   │   ├── facility.repository.mock.ts
│   │   ├── facility.repository.mock.test.ts
│   │   ├── facility.repository.factory.ts
│   │   ├── facility-store.ts
│   │   └── facility-store.test.ts
│   ├── fixtures/         # Normalized mock data
│   │   ├── facilities.json
│   │   └── facility-amenities.json
│   ├── config.ts         # Configuration + error classes
│   └── server.ts         # Express app setup
├── assets/               # Provided assets
│   ├── auth.ts          # Mock authentication utilities
│   └── facilities.json  # Original facility data
├── scripts/
│   └── generate-fixtures.js
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Architecture

### Design Patterns

- **Repository Pattern** - Abstraction layer for data access, easy to swap mock for real database
- **Service Layer** - Business logic separated from controllers
- **Dependency Injection** - Services receive dependencies via constructor
- **Factory Pattern** - Repository factory for easy implementation swapping

### Data Flow

```
Request → Middleware (CORS, Auth, Validation) → Controller → Service → Repository → Response
```

### CAP Theorem

This API is designed with **Availability > Consistency** (AP system):
- Designed for high availability with eventual consistency
- Suitable for read-heavy workloads
- Mock data layer can be replaced with database + caching layer

## Production Considerations

### TODO: Database Migration

The current implementation uses in-memory mock data. For production:

1. **Replace mock repository** with PostgreSQL implementation
2. **Use PostGIS** for geospatial queries
3. **Add indexes** for performance:
   - GIN index on facility names (pg_trgm)
   - GIST index on location (PostGIS)
   - Index on amenities
4. **Add caching layer** (Redis) with 24-hour TTL
5. **Connection pooling** for database connections

See `TODO: PRODUCTION` comments in the code for specific migration points.

### Stretch Goals

- [x] OpenAPI/Swagger documentation ✅
- [ ] Rate limiting
- [ ] Request/response logging with correlation IDs
- [ ] Metrics endpoint (Prometheus format)
- [ ] Docker containerization
- [ ] CI/CD pipeline

## Performance

- **Search algorithm**: O(n) for in-memory filtering (would be O(log n) with database indexes)
- **Haversine distance**: Accurate geo-distance calculation
- **Pagination**: Reduces payload size and improves response time
- **Designed for 100,000+ facilities** with proper database indexes

## Testing

- **34 unit tests** covering all major components
- **Test coverage**: Data store, repositories, services
- **Co-located tests**: Test files next to source files (`.test.ts`)
- **Vitest**: Fast, modern testing framework

## Scripts

```bash
npm run dev          # Start development server with hot reload
npm start            # Start production server
npm test             # Run all tests
npm run test:ui      # Open Vitest UI
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint TypeScript files
npm run format       # Format code with Prettier
```

## Technologies

- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Vitest** - Testing framework
- **Zod** - Schema validation
- **tsx** - TypeScript execution
- **CORS** - Cross-origin resource sharing
- **Swagger** - API documentation (OpenAPI 3.0)

## License

MIT

