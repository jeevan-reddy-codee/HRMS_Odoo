const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.static("public"));
app.use(express.json());



app.get("/api/employees", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM employees");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/employees", async (req, res) => {
    try {
        const {
            user_id,
            full_name,
            phone,
            department,
            job_position,
            joining_date,
            employment_type
        } = req.body;

        const result = await pool.query(
            `INSERT INTO employees
            (user_id, full_name, phone, department, job_position, joining_date, employment_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                user_id,
                full_name,
                phone,
                department,
                job_position,
                joining_date,
                employment_type
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/api/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM employees WHERE id = $1 RETURNING *",
            [id]
        );

        res.json(result.rows[0]);
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