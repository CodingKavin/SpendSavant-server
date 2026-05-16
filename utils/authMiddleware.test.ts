import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import { jwtVerify } from "jose";

vi.mock("jose", async (importOriginal) => {
  process.env.SUPABASE_URL = "https://mock-project.supabase.co";
  const actual = await importOriginal<typeof import("jose")>();
  return {
    ...actual,
    jwtVerify: vi.fn(),
  };
});

import { authenticateJWT, type AuthenticatedRequest } from "../utils/authMiddleware.js";

describe("authenticateJWT Middleware", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      headers: {},
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    nextFunction = vi.fn();
  });

  describe("Header Parsing", () => {
    it("should return 401 if Authorization header is missing", async () => {
      await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Missing or invalid Authorization header" });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if Authorization header does not start with Bearer", async () => {
      mockReq.headers!.authorization = "Basic token123";

      await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if token format is invalid (just 'Bearer ')", async () => {
      mockReq.headers!.authorization = "Bearer ";

      await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid token format" });
    });
  });

  describe("Token Verification", () => {
    it("should return 401 if jwtVerify throws an error (expired/invalid signature)", async () => {
      mockReq.headers!.authorization = "Bearer bad-token";
      vi.mocked(jwtVerify).mockRejectedValue(new Error("JWTExpired"));

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(nextFunction).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it("should return 401 if the token payload is missing the 'sub' claim", async () => {
      mockReq.headers!.authorization = "Bearer valid-sig-no-sub";
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { iss: "supabase" },
        protectedHeader: { alg: "RS256" },
        key: new Uint8Array()
      });

      await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid token payload: missing subject" });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Success Pathways", () => {
    it("should append the user object to req and call next() on valid token", async () => {
      mockReq.headers!.authorization = "Bearer real-good-token";
      
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { sub: "user_uuid_12345" },
        protectedHeader: { alg: "RS256" },
        key: new Uint8Array()
      });

      await authenticateJWT(mockReq as AuthenticatedRequest, mockRes as Response, nextFunction);

      expect(mockReq.user).toEqual({ id: "user_uuid_12345" });
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});