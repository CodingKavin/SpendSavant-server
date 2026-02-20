import express from "express";
import connection from "../utils/mysql.js";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.route("/").get(async (req, res) => {
    const sql = "";
    try {
        const [results] = await connection.query(sql);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error Occured on server");
    }
})

router.route("/:id")
    .get(async (req, res) => {
        const expenseId = req.params.id;
        const sql = ``;
        try {
            const [results] = await connection.query(sql, [expenseId]);
            if (results.length === 0) {
                return res.status(404).json({
                    message: `No expense found with id ${expenseId}`
                });
            }
            res.json(results[0]);
        } catch (error) {
            console.log(error);
            res.status(500).send("Error occured on the server");
        }
    })

    .delete(async (req, res) => {
        const expenseId = req.params.id;

        try {
            const [result] = await connection.query(
                "DELETE FROM expenses WHERE id = ?",
                [expenseId]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: `Expense with ID ${expenseId} not found`
                });
            }
            res.sendStatus(204);
        } catch (error) {
            console.log(error);
            res.status(500).send("Error occured on the server");
        }
    });

export default router;