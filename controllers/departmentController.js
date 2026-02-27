const Department = require('../models/Department');
const Employee = require("../models/Employee");
const departmentService = require("../services/departmentService");
const employeeService = require("../services/employeeService");

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const result = await departmentService.getAllDepartments();
        if (result.success) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
};

// Get single department
exports.getDepartmentById = async (req, res) => {
    try {
        const result = await departmentService.getDepartmentById(req.params.id);
        if (result.success) {
            return res.json(result);
        }
        return res.status(400).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching department',
            error: error.message
        });
    }
};

// Create department
exports.createDepartment = async (req, res) => {
    try {
        const result = await departmentService.createDepartment(req.body);

        if (result.success) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await departmentService.updateDepartment(id, req.body);

        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await departmentService.deleteDepartment(id);

        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
};

// Get employees by department
exports.getDepartmentEmployees = async (req, res) => {
    try {

        const result = await departmentService.getDepartmentEmployees(req.params.id);
        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching department employees',
            error: error.message
        });
    }
};