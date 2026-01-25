import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import faceAuthRoutes from './routes/faceAuthRoutes.js';
import faceService from './utils/faceService.js';

// Init AI Service
faceService.start();



const app = express();
const PORT = process.env.PORT || 5500;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/face-auth', faceAuthRoutes);

// Serve Uploads
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('Construx API Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
