import { HttpError } from 'routing-controllers';

/**
 * This function enables throw-as-expression feature.
 * Throws a new error (Bound to HTTP errors).
 */
function panic(
  kind: { new (code: number, message?: string): HttpError },
  message?: string,
  code = 500
): never {
  throw new kind(code, message);
}

export { panic };
