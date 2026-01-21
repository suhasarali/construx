const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/logs', require('./routes/dailyLogRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Serve Uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Construx API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
