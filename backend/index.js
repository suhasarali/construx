import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

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
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Serve Uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Construx API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
