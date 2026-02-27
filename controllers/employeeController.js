const Employee = require('../models/Employee');
const Department = require('../models/Department');

// Get all employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate('department', 'name')
            .sort({ lastName: 1, firstName: 1 });

        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

// Get single employee
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('department', 'name');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

// Create employee
exports.createEmployee = async (req, res) => {
    try {
        const { firstName, lastName, department, email, phone } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !department) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, and department are required'
            });
        }

        // Check if department exists
        const departmentExists = await Department.findById(department);
        if (!departmentExists) {
            return res.status(400).json({
                success: false,
                message: 'Department not found'
            });
        }

        const employee = new Employee({
            firstName,
            lastName,
            department,
            email,
            phone
        });

        await employee.save();

        const populatedEmployee = await Employee.findById(employee._id)
            .populate('department', 'name');

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: populatedEmployee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        // If department is being updated, verify it exists
        if (req.body.department) {
            const departmentExists = await Department.findById(req.body.department);
            if (!departmentExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Department not found'
                });
            }
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('department', 'name');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

// Get employees by department
exports.getEmployeesByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const employees = await Employee.find({ department: departmentId })
            .populate('department', 'name')
            .sort({ lastName: 1, firstName: 1 });

        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees by department',
            error: error.message
        });
    }
};