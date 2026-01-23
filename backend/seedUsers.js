const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
    try {
        // Drop indexes to fix any stale unique constraints (like non-sparse email)
        try {
            await User.collection.dropIndexes();
        } catch (err) {
            console.log("No indexes to drop or collection doesn't exist yet");
        }
        
        await User.deleteMany(); // Clear existing users

        const users = [
            {
                name: 'Manager User',
                phone: '9999999999',
                password: 'password123',
                role: 'Manager',
                location: { lat: 19.0760, lng: 72.8777 } // Mumbai
            },
            {
                name: 'Engineer User',
                phone: '8888888888',
                password: 'password123',
                role: 'Site_Engineer',
                location: { lat: 19.0760, lng: 72.8777 }
            },
            {
                name: 'Worker User',
                phone: '7777777777',
                password: 'password123',
                role: 'Worker',
                location: { lat: 19.0760, lng: 72.8777 }
            }
        ];

        await User.create(users);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedUsers();
