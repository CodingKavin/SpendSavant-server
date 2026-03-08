import express from "express";
import sql from "../utils/postgres.js";
import { authenticateJWT } from "../utils/authMiddleware.js";
import { validateBudget } from "../utils/expenseValidation.js";

const router = express.Router();

router.use(authenticateJWT)

router.route("/")
    .get(async (req, res) => {
        const user_id = req.user.id;
        const { month, year } = req.query;

        const monthNum = Number(month);
        const yearNum = Number(year)

        if (!month || !year || isNaN(monthNum) || isNaN(yearNum)) {
            return res.status(400).json({ error: "Month and Year must be valid" });
        }

        try {
            const result = await sql`
            SELECT * FROM budgets
            WHERE user_id = ${user_id} AND month = ${monthNum} AND year = ${yearNum}
            `;

            return res.status(200).json({ budget: result[0] || null });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error Occurred on server" });
        }
    })
    .post(async (req, res) => {
        const user_id = req.user.id;
        const { month, year, amount } = req.body;

        const monthNum = Number(month);
        const yearNum = Number(year);
        const amountNum = Number(amount);

        if (isNaN(monthNum) || isNaN(yearNum) || isNaN(amountNum)) {
            return res.status(400).json({ error: "Month, Year, and Amount must be valid" })
        }

        const errors = validateBudget({ user_id, month: monthNum, year: yearNum, amount: amountNum });
        if (errors) return res.status(400).json({ errors });

        try {
            const [budget] = await sql`
            INSERT INTO budgets (user_id, month, year, amount)
            VALUES (${user_id}, ${monthNum}, ${yearNum}, ${amountNum})
            ON CONFLICT (user_id, month, year)
            DO UPDATE SET amount = EXCLUDED.amount
            RETURNING *
            `;

            return res.status(201).json({ budget });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error Occurred on server" });
        }
    })
    ;

export default router;