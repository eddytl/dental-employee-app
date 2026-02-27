const employeeService = require('../services/employeeService');

/**
 * GET /api/employees
 * Get all employees
 */
exports.getAllEmployees = async (req, res) => {
    try {
        const result = await employeeService.getAllEmployees();

        if (result.success) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};


/**
 * GET /api/employees/:id
 * Get employee by ID
 */
exports.getEmployeeById = async (req, res) => {
    try {
        const {id} = req.params;

        const result = await employeeService.getEmployeeById(id);

        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};


/**
 * POST /api/employees
 * Create new employee
 */
exports.createEmployee = async (req, res) => {
    try {
        const result = await employeeService.createEmployee(req.body);

        if (result.success) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};


/**
 * PUT /api/employees/:id
 * Update employee
 */
exports.updateEmployee = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await employeeService.updateEmployee(id, req.body);

        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};


/**
 * DELETE /api/employees/:id
 * Delete employee
 */
exports.deleteEmployee = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await employeeService.deleteEmployee(id);

        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

/**
 * GET /api/employees/department/:departmentId
 * Get employees by department
 */
exports.getEmployeesByDepartment = async (req, res) => {
    try {
        const {departmentId} = req.params;

        const result = await employeeService.getEmployeesByDepartment(departmentId);

        if (result.success) {
            return res.json(result);
        }

        return res.status(404).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees by department',
            error: error.message
        });
    }
};

/**
 * GET /api/employees/search?q=term
 * Search employees
 */
exports.searchEmployees = async (req, res) => {
    try {
        const {q} = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
        }

        const result = await employeeService.searchEmployees(q);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};