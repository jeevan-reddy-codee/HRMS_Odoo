const express = require("express");
const {
    getEmployees,
    createEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

router.get("/", getEmployees);
router.post("/", createEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;