const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// GET all departments
router.get('/', departmentController.getAllDepartments);

// GET single department
router.get('/:id', departmentController.getDepartmentById);

// POST create department
router.post('/', departmentController.createDepartment);

// PUT update department
router.put('/:id', departmentController.updateDepartment);

// DELETE department
router.delete('/:id', departmentController.deleteDepartment);

// GET employees in a department
router.get('/:id/employees', departmentController.getDepartmentEmployees);

module.exports = router;