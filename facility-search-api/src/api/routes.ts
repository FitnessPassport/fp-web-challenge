/**
 * API Routes and Controllers
 * All endpoints and request handlers
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { FacilityService } from '../lib/facility.service.js';
import { createFacilityRepository } from '../lib/facility.repository.factory.js';
import { authenticate, validateQuery, validateParams, schemas } from './middleware.js';
import { appConfig } from '../config.js';
import type { SearchParams } from './types.js';

// ============================================================================
// Service Initialization
// ============================================================================

const repository = createFacilityRepository();
const facilityService = new FacilityService(repository);

// ============================================================================
// Controllers
// ============================================================================

async function searchFacilities(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const params = req.query as SearchParams;
    const result = await facilityService.searchFacilities(params);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getFacilityById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const facility = await facilityService.getFacilityById(id);
    
    res.json({
      success: true,
      data: facility,
    });
  } catch (error) {
    next(error);
  }
}

async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const health = await facilityService.healthCheck();
    
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// Routes
// ============================================================================

const router = Router();

/**
 * @swagger
 * /facilities/status:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     facilityCount:
 *                       type: number
 */
router.get('/facilities/status', healthCheck);

/**
 * @swagger
 * /facilities:
 *   get:
 *     summary: Search facilities
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *         description: Search by facility name (partial match)
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Location latitude (-90 to 90)
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Location longitude (-180 to 180)
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *         description: Search radius in kilometers
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by amenities (must have all)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     facilities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Facility'
 *                     total:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     offset:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/facilities', authenticate, validateQuery(schemas.search), searchFacilities);

/**
 * @swagger
 * /facilities/{id}:
 *   get:
 *     summary: Get facility by ID
 *     tags: [Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Facility details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Facility'
 *       404:
 *         description: Facility not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/facilities/:id', authenticate, validateParams(schemas.id), getFacilityById);

// Root endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'Facility Search API',
    version: appConfig.apiVersion,
    endpoints: {
      health: `${appConfig.apiPrefix}/facilities/status`,
      search: `${appConfig.apiPrefix}/facilities`,
      getById: `${appConfig.apiPrefix}/facilities/:id`,
      docs: '/api-docs',
    },
  });
});

export default router;
