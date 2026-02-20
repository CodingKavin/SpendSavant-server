import { jwtVerify, createRemoteJWKSet } from "jose";

const supabaseUrl = process.env.SUPABASE_URL;
const jwks = createRemoteJWKSet(
    new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)
);

export async function authenticateJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];

        const { payload } = await jwtVerify(token, jwks, {
            issuer: `${supabaseUrl}/auth/v1`,
        });

        req.user = { id: payload.sub };
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        res.status(401).json({ message: "Unauthorized" });
    }
}