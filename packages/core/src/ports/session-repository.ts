/** Resolves an Auth.js database session cookie to its user (ADR-0008). */
export type SessionRepository = {
  findUserIdBySessionToken(token: string): Promise<string | null>;
};
