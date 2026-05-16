import type {Request, Response, NextFunction} from "express";
import { jwtVerify, createRemoteJWKSet } from "jose";

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL environment variable");
}
const jwks = createRemoteJWKSet(
    new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
);

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export async function authenticateJWT(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const { payload } = await jwtVerify(token, jwks, {
            issuer: `${supabaseUrl}/auth/v1`,
        });

        if (!payload.sub) {
            return res.status(401).json({ message: "Invalid token payload: missing subject" });
        }

        req.user = { id: payload.sub };
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        res.status(401).json({ message: "Unauthorized" });
    }
}