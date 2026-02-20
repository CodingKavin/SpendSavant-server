import "dotenv/config";
import cors from "cors";
import express from "express";
import expenses from "./routes/expenses.js";


const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json()); // allows parsing JSON data from req objects

app.use("/expenses", expenses);

app.listen(port, () => console.log(`Listening on ${port}`));