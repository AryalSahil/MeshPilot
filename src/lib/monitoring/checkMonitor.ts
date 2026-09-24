import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

// Check if IP is private/unsafe
export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const normalized = ip.trim().toLowerCase();
  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '0.0.0.0' || normalized === '::1') {
    return true;
  }

  const parts = normalized.split('.').map(Number);
  if (parts.length === 4 && !parts.some(isNaN)) {
    const [a, b, c, d] = parts;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (link-local / AWS metadata endpoint is 169.254.169.254)
    if (a === 169 && b === 254) return true;
  }
  return false;
}

// Validate URL and hostname to block SSRF
export async function isSafeUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    
    // Only HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // Check hostname string directly
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
      return false;
    }

    // Resolve IPv4 addresses to verify DNS rebinding and private ranges
    try {
      const ips = await resolve4(parsed.hostname);
      if (ips.length === 0) return false;
      for (const ip of ips) {
        if (isPrivateIp(ip)) {
          return false;
        }
      }
    } catch (e) {
      // If resolution fails but hostname is an IP itself, validate it
      if (isPrivateIp(parsed.hostname)) {
        return false;
      }
    }

    return true;
  } catch (err) {
    return false;
  }
}

export interface CheckResult {
  status: 'UP' | 'DOWN' | 'TIMEOUT' | 'ERROR';
  statusCode?: number;
  responseTimeMs: number;
  errorType?: string;
  errorMessage?: string;
}

export async function checkMonitorUrl(
  url: string,
  method: 'GET' | 'HEAD' = 'GET',
  timeoutMs: number = 10000,
  expectedStatus: number = 200
): Promise<CheckResult> {
  const startTime = Date.now();

  // SSRF URL Security Validation
  const safe = await isSafeUrl(url);
  if (!safe) {
    return {
      status: 'ERROR',
      responseTimeMs: Date.now() - startTime,
      errorType: 'SSRF_PROTECTION_TRIGGERED',
      errorMessage: 'SSRF validation failed: Unsafe or private destination address was blocked.',
    };
  }

  let currentUrl = url;
  let redirectsFollowed = 0;
  const maxRedirects = 5;

  while (redirectsFollowed <= maxRedirects) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchStart = Date.now();
      const res = await fetch(currentUrl, {
        method,
        redirect: 'manual', // Manually intercept to perform SSRF checks on each hop
        signal: controller.signal,
        headers: {
          'User-Agent': 'MeshPilot/1.0 EdgeTelemetryMonitor',
          'Accept': '*/*'
        }
      });

      clearTimeout(timeoutId);
      const responseTimeMs = Date.now() - fetchStart;

      // Handle Redirects Manually with SSRF Check
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) {
          return {
            status: 'DOWN',
            statusCode: res.status,
            responseTimeMs,
            errorType: 'INVALID_REDIRECT',
            errorMessage: `Received redirect status ${res.status} but no Location header was present.`,
          };
        }

        // Parse absolute or relative destination URL
        const absoluteUrl = new URL(location, currentUrl).toString();
        
        // Re-validate hopped URL for SSRF
        const hopSafe = await isSafeUrl(absoluteUrl);
        if (!hopSafe) {
          return {
            status: 'ERROR',
            responseTimeMs: Date.now() - startTime,
            errorType: 'SSRF_PROTECTION_TRIGGERED',
            errorMessage: 'SSRF validation failed on redirect hop: Unsafe target blocked.',
          };
        }

        currentUrl = absoluteUrl;
        redirectsFollowed++;
        continue;
      }

      // Check expected status code
      if (res.status === expectedStatus) {
        return {
          status: 'UP',
          statusCode: res.status,
          responseTimeMs,
        };
      } else {
        return {
          status: 'DOWN',
          statusCode: res.status,
          responseTimeMs,
          errorType: 'HTTP_STATUS_MISMATCH',
          errorMessage: `Expected HTTP ${expectedStatus}, received HTTP ${res.status}`,
        };
      }

    } catch (err: any) {
      clearTimeout(timeoutId);
      const responseTimeMs = Date.now() - startTime;

      if (err.name === 'AbortError') {
        return {
          status: 'TIMEOUT',
          responseTimeMs,
          errorType: 'TIMEOUT_EXCEEDED',
          errorMessage: `Connection timeout after exceeding limit of ${timeoutMs}ms.`,
        };
      }

      return {
        status: 'ERROR',
        responseTimeMs,
        errorType: err.code || 'CONNECTION_FAILURE',
        errorMessage: err.message || 'DNS resolution or network connection failed.',
      };
    }
  }

  return {
    status: 'DOWN',
    responseTimeMs: Date.now() - startTime,
    errorType: 'REDIRECT_LIMIT_EXCEEDED',
    errorMessage: `Outbound redirects exceeded the safe pipeline limit of ${maxRedirects} hops.`,
  };
}
