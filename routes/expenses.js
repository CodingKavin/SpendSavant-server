import express from "express";
import sql from "../utils/postgres.js";
import { authenticateJWT } from "../utils/authMiddleware.js";
import { validateExpense, validateExpenseUpdate } from "../utils/expenseValidation.js";

const router = express.Router();

router.use(authenticateJWT)

router.route("/")
    .get(async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const expenses = await sql`SELECT * FROM expenses 
            WHERE user_id = ${req.user.id} 
            ORDER BY date DESC
            LIMIT ${limit} OFFSET ${offset}`;

            const [countResult] = await sql`
            SELECT COUNT(*) AS total
            FROM expenses
            WHERE user_id = ${req.user.id}`;

            const total = parseInt(countResult.total);

            res.json({ page, limit, total, totalPages: Math.ceil(total / limit), expenses: expenses });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error Occurred on server");
        }
    })
    .post(async (req, res) => {
        try {
            const errors = validateExpense(req.body);
            if (errors) {
                return res.status(400).json({ errors });
            }
            const { category, amount, date, description, recurrence } = req.body;
            const [newExpense] = await sql`INSERT INTO expenses(user_id, category, amount, date, description, recurrence, created_at, updated_at)
            VALUES(${req.user.id}, ${category}, ${amount}, ${date}, ${description}, ${recurrence}, NOW(), NOW()) RETURNING *`;
            res.status(201).json(newExpense);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error Occurred on server" });
        }
    })

router.route("/:id")
    .get(async (req, res) => {
        try {
            const expenseId = req.params.id;
            const [expense] = await sql`SELECT * FROM expenses WHERE id = ${expenseId} AND user_id = ${req.user.id}`

            if (!expense) {
                return res.status(404).json({ message: "Expense not found" });
            }

            res.json(expense);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error Occurred on server" });
        }
    })
    .delete(async (req, res) => {
        try {
            const expenseId = req.params.id;
            const result = await sql`DELETE FROM expenses WHERE id = ${expenseId} AND user_id = ${req.user.id} RETURNING *`;
            if (result.length === 0) {
                return res.status(404).json({ message: "Expense not found" });
            }
            res.status(200).json({ deleted: result[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error Occurred on server" });
        }
    })
    .patch(async (req, res) => {
        try {
            const expenseId = req.params.id;
            const errors = validateExpenseUpdate(req.body);
            if (errors) {
                return res.status(400).json({ errors })
            }

            const fields = req.body;
            const keys = Object.keys(fields);

            if (keys.length === 0) {
                return res.status(400).json({ message: "No fields provided for update" });
            }
            const setClause = keys
                .map(key => sql`${key} = ${fields[key]}`)
                .reduce((a, b) => sql`${a}, ${b}`);

            const [updatedExpense] = await sql`UPDATE expenses 
            SET ${setClause}, updated_at = NOW() 
            WHERE id = ${expenseId} AND user_id = ${req.user.id}
            RETURNING *`;

            if (!updatedExpense) {
                return res.status(404).json({ message: "Expense not found" });
            }

            res.json(updatedExpense);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error occured on server" });
        }
    })

export default router;