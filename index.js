const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5050;
const connectDb = require('./config/db');
//const seedDatabase = require('./seed');
const cors = require('cors');
const departmentRoutes = require('./routes/departments');
const employeeRoutes = require('./routes/employees');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Also handle direct routes for SPA-like navigation
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/employees', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/departments', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

connectDb().then(r => console.log("Connected to the database..."));
//seedDatabase();



// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Dental Practice Employee Management API',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


app.listen(port, () => {
    console.log("Express server started " + port);
})