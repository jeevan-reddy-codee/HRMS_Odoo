const express = require("express");
const pool = require("./db");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use("/api/employees", employeeRoutes);



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