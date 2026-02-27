const Employee = require('../models/Employee');

class EmployeeService {
    /**
     * Get all employees with populated department data
     */
    async getAllEmployees() {
        try {
            const employees = await Employee.find()
                .populate('department', 'name description')
                .sort({lastName: 1, firstName: 1});

            return {
                success: true,
                count: employees.length,
                data: employees
            };
        } catch (error) {
            throw new Error(`Error fetching employees: ${error.message}`);
        }
    }

    /**
     * Get employee by ID
     */
    async getEmployeeById(employeeId) {
        try {
            const employee = await Employee.findById(employeeId)
                .populate('department', 'name description');

            if (!employee) {
                return {
                    success: false,
                    message: 'Employee not found'
                };
            }

            return {
                success: true,
                data: employee
            };
        } catch (error) {
            throw new Error(`Error fetching employee: ${error.message}`);
        }
    }

    /**
     * Get employees by department
     */
    async getEmployeesByDepartment(departmentId) {
        try {
            const employees = await Employee.find({department: departmentId})
                .populate('department', 'name description')
                .sort({lastName: 1, firstName: 1});

            return {
                success: true,
                data: employees,
                count: employees.length
            };
        } catch (error) {
            throw new Error(`Error fetching employees by department: ${error.message}`);
        }
    }

    /**
     * Create a new employee
     */
    async createEmployee(employeeData) {
        try {
            const {firstName, lastName, department, email, phone} = employeeData;

            // Validate required fields
            if (!firstName || !lastName || !department) {
                return {
                    success: false,
                    message: 'First name, last name, and department are required'
                };
            }

            const employee = new Employee({
                firstName,
                lastName,
                department,
                email,
                phone
            });

            await employee.save();

            // Populate department data for response
            await employee.populate('department', 'name description');

            return {
                success: true,
                message: 'Employee created successfully',
                data: employee
            };
        } catch (error) {
            throw new Error(`Error creating employee: ${error.message}`);
        }
    }

    /**
     * Update an employee
     */
    async updateEmployee(employeeId, updateData) {
        try {
            const employee = await Employee.findByIdAndUpdate(
                employeeId,
                updateData,
                {new: true, runValidators: true}
            ).populate('department', 'name description');

            if (!employee) {
                return {
                    success: false,
                    message: 'Employee not found'
                };
            }

            return {
                success: true,
                message: 'Employee updated successfully',
                data: employee
            };
        } catch (error) {
            throw new Error(`Error updating employee: ${error.message}`);
        }
    }

    /**
     * Delete an employee
     */
    async deleteEmployee(employeeId) {
        try {
            const employee = await Employee.findByIdAndDelete(employeeId);

            if (!employee) {
                return {
                    success: false,
                    message: 'Employee not found'
                };
            }

            return {
                success: true,
                message: 'Employee deleted successfully'
            };
        } catch (error) {
            throw new Error(`Error deleting employee: ${error.message}`);
        }
    }

    /**
     * Search employees by name
     */
    async searchEmployees(searchTerm) {
        try {
            const employees = await Employee.find({
                $or: [
                    {firstName: {$regex: searchTerm, $options: 'i'}},
                    {lastName: {$regex: searchTerm, $options: 'i'}}
                ]
            }).populate('department', 'name description');

            return {
                success: true,
                data: employees,
                count: employees.length
            };
        } catch (error) {
            throw new Error(`Error searching employees: ${error.message}`);
        }
    }
}

module.exports = new EmployeeService();