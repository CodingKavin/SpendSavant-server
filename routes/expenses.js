import express from "express";
import sql from "../utils/postgres.js";
import { authenticateJWT } from "./utils/authMiddleware.js"

const router = express.Router();

router.use(authenticateJWT)

router.route("/").get(async (req, res) => {
    const sql = "";
    try {
        const expenses = await sql`SELECT * FROM expenses WHERE user_id = ${req.user.id}`;
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error Occured on server");
    }
})

export default router;