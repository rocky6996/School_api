require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { body, validationResult, query } = require('express-validator');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'school_management'
};

// Add health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Validation middleware for addSchool endpoint
const validateSchool = [
    body('name').notEmpty().trim().escape(),
    body('address').notEmpty().trim(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 })
];

// Add School API
app.post('/addSchool', validateSchool, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, address, latitude, longitude } = req.body;
        const connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );

        await connection.end();

        res.status(201).json({
            message: 'School added successfully',
            schoolId: result.insertId
        });
    } catch (error) {
        console.error('Error adding school:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List Schools API
app.get('/listSchools', [
    query('latitude').isFloat({ min: -90, max: 90 }),
    query('longitude').isFloat({ min: -180, max: 180 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { latitude, longitude } = req.query;
        const connection = await mysql.createConnection(dbConfig);

        const [schools] = await connection.execute('SELECT * FROM schools');
        await connection.end();

        // Calculate distances and sort schools
        const schoolsWithDistance = schools.map(school => ({
            ...school,
            distance: calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                school.latitude,
                school.longitude
            )
        }));

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.json(schoolsWithDistance);
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create database and table if they don't exist
async function initializeDatabase() {
    try {
        // First connect without database selected
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        await connection.query(`USE ${dbConfig.database}`);

        // Create schools table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS schools (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address VARCHAR(255) NOT NULL,
                latitude FLOAT NOT NULL,
                longitude FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.end();
        console.log('Database and table initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        // Don't exit process on database error in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Continuing despite database error in production');
        } else {
            process.exit(1);
        }
    }
}

// Initialize database and start server
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to initialize database:', error);
    // In production, start server anyway
    if (process.env.NODE_ENV === 'production') {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT} (without database)`);
        });
    }
}); 