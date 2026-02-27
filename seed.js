const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const Department = require('./models/Department');
const Employee = require('./models/Employee');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Department.deleteMany({});
        await Employee.deleteMany({});

        console.log('Cleared existing data');

        // Create departments
        const departments = await Department.create([
            { name: 'General Dentistry', description: 'General dental care and checkups' },
            { name: 'Pediatric Dentistry', description: 'Dental care for children' },
            { name: 'Restorative Dentistry', description: 'Restoration of damaged teeth' },
            { name: 'Surgery', description: 'Oral surgical procedures' },
            { name: 'Orthodontics', description: 'Braces and teeth alignment' }
        ]);

        console.log('Created departments');

        // Map departments by name for easy reference
        const deptMap = {};
        departments.forEach(dept => {
            deptMap[dept.name] = dept._id;
        });

        // Create employees based on the provided data
        const employees = [
            // General Dentistry
            { firstName: 'Alfred', lastName: 'Christensen', department: deptMap['General Dentistry'] },
            { firstName: 'John', lastName: 'Dudley', department: deptMap['General Dentistry'] },
            { firstName: 'Janet', lastName: 'Doe', department: deptMap['General Dentistry'] },

            // Pediatric Dentistry
            { firstName: 'Francisco', lastName: 'Willard', department: deptMap['Pediatric Dentistry'] },
            { firstName: 'Sarah', lastName: 'Alvarez', department: deptMap['Pediatric Dentistry'] },

            // Restorative Dentistry
            { firstName: 'Lisa', lastName: 'Harris', department: deptMap['Restorative Dentistry'] },
            { firstName: 'Danny', lastName: 'Perez', department: deptMap['Restorative Dentistry'] },

            // Surgery
            { firstName: 'Constance', lastName: 'Smith', department: deptMap['Surgery'] },

            // Orthodontics
            { firstName: 'Leslie', lastName: 'Roche', department: deptMap['Orthodontics'] },
            { firstName: 'Lisa', lastName: 'Harris', department: deptMap['Orthodontics'] } // Lisa works in two departments
        ];

        // Add unique constraint for employee-department combination?
        // For now, we'll allow the same person in multiple departments
        await Employee.create(employees);

        console.log('Created employees');

        // Verify the data
        const employeeCount = await Employee.countDocuments();
        const deptCount = await Department.countDocuments();

        console.log(`Database seeded successfully!`);
        console.log(`- ${deptCount} departments created`);
        console.log(`- ${employeeCount} employees created`);

        // Show employees by department
        console.log('\nEmployees by department:');
        for (const dept of departments) {
            const deptEmployees = await Employee.find({ department: dept._id })
                .populate('department', 'name');
            console.log(`\n${dept.name}:`);
            deptEmployees.forEach(emp => {
                console.log(`  - ${emp.firstName} ${emp.lastName}`);
            });
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
};

module.exports = seedDatabase;