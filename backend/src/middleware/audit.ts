import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client.js';
import { logger } from '../logger/index.js';

export function auditMiddleware(resourceName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only audit mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Async write to immutable AuditLog table without blocking response
      (async () => {
        try {
          const actorId = req.user?.id || 'ANONYMOUS';
          const actorName = req.user?.name || 'Unauthenticated';
          const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
          const targetId = req.params.id || body?.id || body?.data?.id || null;

          const diff = {
            method: req.method,
            path: req.originalUrl,
            params: req.params,
            query: req.query,
            body: req.body ? sanitizeBody(req.body) : null,
            status: res.statusCode
          };

          await prisma.auditLog.create({
            data: {
              actorId,
              actorName,
              action: `${req.method} ${resourceName}`,
              targetResource: resourceName,
              targetId: targetId ? String(targetId) : null,
              diffJson: JSON.stringify(diff),
              ipAddress: String(ipAddress),
              timestamp: new Date()
            }
          });

          logger.info(`Audit Log recorded: ${req.method} ${resourceName}`, {
            actorId,
            action: `${req.method} ${resourceName}`,
            targetId,
            correlationId: req.correlationId
          });
        } catch (auditErr: any) {
          logger.error('Failed to persist statutory audit record', { error: auditErr.message, correlationId: req.correlationId });
        }
      })();

      return originalJson(body);
    };

    next();
  };
}

function sanitizeBody(body: any): any {
  if (typeof body !== 'object' || body === null) return body;
  const copy = { ...body };
  if (copy.password) copy.password = '[REDACTED]';
  if (copy.passwordHash) copy.passwordHash = '[REDACTED]';
  if (copy.token) copy.token = '[REDACTED]';
  return copy;
}
