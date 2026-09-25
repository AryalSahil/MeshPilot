import crypto from 'crypto';

// Hash raw ingestion key for storage
export function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

// Generate raw key (shown only once)
export function generateRawKey(): string {
  return `mp_err_${crypto.randomBytes(24).toString('hex')}`;
}

// Deterministic grouping (Fingerprinting)
export function calculateFingerprint(data: {
  exceptionType: string;
  message: string;
  stackTrace?: string;
  endpoint?: string;
}): string {
  const excType = (data.exceptionType || 'Error').trim();
  
  // Normalize message - strip dynamic parts to group together
  let normMsg = (data.message || '').trim();
  normMsg = normMsg.replace(/\d+/g, '{num}'); // remove numbers
  normMsg = normMsg.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '{uuid}'); // remove UUIDs
  normMsg = normMsg.replace(/0x[0-9a-fA-F]+/g, '{hex}'); // remove hex/memory addresses
  normMsg = normMsg.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '{url}'); // remove URLs
  
  // Clean stack frames - get first two call sites and remove exact file line numbers
  let stackFrame = '';
  if (data.stackTrace) {
    const lines = data.stackTrace
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('at ') || l.includes('@'));
    if (lines.length > 0) {
      stackFrame = lines.slice(0, 2).join('|').replace(/:\d+:\d+/g, '');
    }
  }

  const endpoint = (data.endpoint || '').trim();
  
  const input = `${excType}:${normMsg}:${stackFrame}:${endpoint}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Strict sanitizer to prevent storing PII or secrets
export function sanitizeSensitiveData(input: any): any {
  if (typeof input === 'string') {
    let sanitized = input;
    // Mask typical credentials and tokens
    const patterns = [
      /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
      /token=[a-zA-Z0-9_\-\.]+/gi,
      /password=[a-zA-Z0-9_\-\.]+/gi,
      /secret=[a-zA-Z0-9_\-\.]+/gi,
      /key=[a-zA-Z0-9_\-\.]+/gi,
      /(?:authorization|cookie):\s*[^\n]+/gi
    ];
    for (const pat of patterns) {
      sanitized = sanitized.replace(pat, (match) => {
        const parts = match.split(/[\s=:]/);
        return parts.length > 1 ? `${parts[0]}=[MASKED]` : '[MASKED]';
      });
    }
    return sanitized;
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeSensitiveData);
  }
  
  if (input !== null && typeof input === 'object') {
    const sanitizedObj: any = {};
    const sensitiveKeys = [
      'password', 'passwd', 'token', 'cookie', 'authorization', 'cookie',
      'apikey', 'api_key', 'secret', 'creditcard', 'cc', 'cvv', 'payment',
      'auth', 'jwt', 'private'
    ];
    for (const [key, val] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitizedObj[key] = '[MASKED]';
      } else {
        sanitizedObj[key] = sanitizeSensitiveData(val);
      }
    }
    return sanitizedObj;
  }
  
  return input;
}

// User Agent parser helper
export function parseUserAgent(ua: string) {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
  
  const uaLower = ua.toLowerCase();
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('safari')) browser = 'Safari';
  else if (uaLower.includes('edge')) browser = 'Edge';
  else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera';

  if (uaLower.includes('windows')) os = 'Windows';
  else if (uaLower.includes('macintosh') || uaLower.includes('mac os')) os = 'macOS';
  else if (uaLower.includes('linux')) os = 'Linux';
  else if (uaLower.includes('android')) os = 'Android';
  else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';

  if (uaLower.includes('mobile') || uaLower.includes('android') || uaLower.includes('iphone')) {
    device = 'Mobile';
  } else if (uaLower.includes('tablet') || uaLower.includes('ipad')) {
    device = 'Tablet';
  }

  return { browser, os, device };
}
