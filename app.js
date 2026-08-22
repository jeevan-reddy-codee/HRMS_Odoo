const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.static("public"));



app.get("/api/employees", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM employees");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/", (req, res) => {
    res.send("HRMS backend is running");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});