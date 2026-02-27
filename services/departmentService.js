const Department = require('../models/Department');
const Employee = require("../models/Employee");

class DepartmentService {
    async getAllDepartments() {
        try {
            const departments = await Department.find().sort({name: 1});
            return {
                success: true,
                data: departments,
                count: departments.length
            };
        } catch (error) {
            throw new Error(`Error fetching departments: ${error.message}`);
        }
    }

    async getDepartmentById(departmentId) {
        try {
            const department = await Department.findById(departmentId);

            if (!department) {
                return {
                    success: false,
                    message: 'Department not found'
                };
            }

            return {
                success: true,
                data: department
            };
        } catch (error) {
            throw new Error(`Error fetching department: ${error.message}`);
        }
    }

    async createDepartment(departmentData) {
        try {
            const {name, description} = departmentData;

            // Check if department exists
            const existingDept = await Department.findOne({name});
            if (existingDept) {
                return {
                    success: false,
                    message: 'Department already exists'
                };
            }

            const department = new Department({name, description});
            await department.save();

            return {
                success: true,
                message: 'Department created successfully',
                data: department
            };
        } catch (error) {
            throw new Error(`Error creating department: ${error.message}`);
        }
    }

    async getDepartmentEmployees(departmentId) {
        try {
            const employees = await Employee.find({department: departmentId})
                .populate('department', 'name');

            return {
                success: true,
                count: employees.length,
                data: employees
            };
        } catch (error) {
            throw new Error(`Error fetching department employees: ${error.message}`);
        }
    }

    /**
     * Update a department
     */
    async updateDepartment(departmentId, updateData) {

        try {
            const department = await Department.findByIdAndUpdate(
                departmentId,
                updateData,
                {new: true, runValidators: true}
            );

            if (!department) {
                return {
                    success: false,
                    message: 'Department not found'
                };
            }

            return {
                success: true,
                message: 'Department updated successfully',
                data: department
            };
        } catch (error) {
            throw new Error(`Error updating department : ${error.message}`);
        }
    }

    async deleteDepartment(departmentId) {

        try {
            const department = await Department.findById(departmentId);

            if (!department) {
                return {
                    success: false,
                    message: 'Department not found'
                };
            }

            // Check if department has employees
            const employeesInDepartment = await Employee.countDocuments({department: departmentId});

            if (employeesInDepartment > 0) {
                return {
                    success: false,
                    message: 'Cannot delete department with assigned employees'
                };
            }

            await department.deleteOne();
            return {
                success: true,
                message: 'Department deleted successfully'
            };
        } catch (error) {
            throw new Error(`Error deleting department : ${error.message}`);
        }
    }
}

module.exports = new DepartmentService();