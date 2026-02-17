import express from "express";
import connection from "../utils/mysql.js";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.route("/").get(async (req, res) => {
    const sql = ``;
    try {
        const [results] = await connection.query(sql);
        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error occured on the server");
    }
});

router.route("/:id")
    .get(async (req, res) => {
        const userId = req.params.id;
        const sql = ``;
        try {
            const [results] = await connection.query(sql, [userId]);
            if (results.length === 0) {
                return res.status(404).json({
                    message: `No users found with id ${userId}`
                });
            }
            res.json(results[0]);
        } catch (error) {
            console.log(error);
            res.status(500).send("Error occured on the server");
        }
    });

export default router;