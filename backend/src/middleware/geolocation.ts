import { Request, Response, NextFunction } from 'express';
import geoip from 'geoip-lite';

export interface GeoLocationData {
  countryCode: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
}

// Extend Express Request to include geolocation data
declare global {
  namespace Express {
    interface Request {
      geo?: GeoLocationData;
    }
  }
}

/**
 * Middleware to detect user's country based on IP address
 * Adds geo object to request with country code and location data
 */
export const geolocationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get IP from various headers (for proxy/load balancer scenarios)
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;

    let clientIp =
      forwardedFor?.split(',')[0] ||
      realIp ||
      req.socket.remoteAddress ||
      req.ip;

    // Remove IPv6 prefix if present
    if (clientIp?.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7);
    }

    // For local development, default to a specific country (e.g., Brazil)
    if (clientIp === '127.0.0.1' || clientIp === '::1' || !clientIp) {
      req.geo = {
        countryCode: 'BR', // Default to Brazil for local dev
        country: 'Brazil',
        region: null,
        city: null,
      };
      return next();
    }

    // Lookup geolocation data
    const geo = geoip.lookup(clientIp);

    if (geo) {
      req.geo = {
        countryCode: geo.country,
        country: geo.country,
        region: geo.region,
        city: geo.city,
      };
    } else {
      // Fallback if geolocation fails
      req.geo = {
        countryCode: null,
        country: null,
        region: null,
        city: null,
      };
    }

    next();
  } catch (error) {
    console.error('Geolocation middleware error:', error);
    // Set default values on error
    req.geo = {
      countryCode: null,
      country: null,
      region: null,
      city: null,
    };
    next();
  }
};
