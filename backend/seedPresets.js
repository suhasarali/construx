import MaterialPreset from './models/MaterialPreset.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

const presets = [
    // Basic Structural
    {
        name: 'Cement',
        unit: '50kg Bag',
        basePrice: 400,
        gstRate: 28,
        hsnCode: '2523'
    },
    {
        name: 'Steel',
        unit: 'kg',
        basePrice: 65,
        gstRate: 18,
        hsnCode: '7214'
    },
    {
        name: 'Sand',
        unit: 'ft3',
        basePrice: 50,
        gstRate: 5,
        hsnCode: '2505'
    },
    {
        name: 'Red Bricks',
        unit: 'Partner', // usually per piece
        basePrice: 8,
        gstRate: 5,
        hsnCode: '6901'
    },
    {
        name: 'Fly Ash Bricks',
        unit: 'Piece',
        basePrice: 6,
        gstRate: 5,
        hsnCode: '6810'
    },
    {
        name: 'Aggregate 20mm',
        unit: 'ft3',
        basePrice: 45,
        gstRate: 5,
        hsnCode: '2517'
    },
    {
        name: 'Aggregate 10mm',
        unit: 'ft3',
        basePrice: 48,
        gstRate: 5,
        hsnCode: '2517'
    },
    {
        name: 'RMC (Concrete)',
        unit: 'm3',
        basePrice: 4500,
        gstRate: 18,
        hsnCode: '3824'
    },

    // Finishing
    {
        name: 'Wall Paint (Premium)',
        unit: '20L Bucket',
        basePrice: 4500,
        gstRate: 18,
        hsnCode: '3209'
    },
    {
        name: 'Primer',
        unit: '20L Bucket',
        basePrice: 1200,
        gstRate: 18,
        hsnCode: '3209'
    },
    {
        name: 'Putty',
        unit: '40kg Bag',
        basePrice: 850,
        gstRate: 18,
        hsnCode: '3214'
    },
    {
        name: 'Vitrified Tiles',
        unit: 'sq.ft',
        basePrice: 45,
        gstRate: 18,
        hsnCode: '6907'
    },
    {
        name: 'Ceramic Tiles',
        unit: 'sq.ft',
        basePrice: 30,
        gstRate: 18,
        hsnCode: '6907'
    },
    {
        name: 'Granite',
        unit: 'sq.ft',
        basePrice: 150,
        gstRate: 18,
        hsnCode: '6802'
    },

    // Wood & Carpentry
    {
        name: 'Plywood 18mm',
        unit: 'sq.ft',
        basePrice: 90,
        gstRate: 18,
        hsnCode: '4412'
    },
    {
        name: 'Plywood 12mm',
        unit: 'sq.ft',
        basePrice: 65,
        gstRate: 18,
        hsnCode: '4412'
    },
    {
        name: 'Teak Wood',
        unit: 'ft3',
        basePrice: 3500,
        gstRate: 18,
        hsnCode: '4407'
    },

    // Plumbing & Electrical
    {
        name: 'PVC Pipe 4 inch',
        unit: '20ft Length',
        basePrice: 450,
        gstRate: 18,
        hsnCode: '3917'
    },
    {
        name: 'CPVC Pipe 1 inch',
        unit: '10ft Length',
        basePrice: 250,
        gstRate: 18,
        hsnCode: '3917'
    },
    {
        name: 'Electrical Wire 1.5sqmm',
        unit: '90m Coil',
        basePrice: 1200,
        gstRate: 18,
        hsnCode: '8544'
    },
    {
        name: 'Electrical Wire 2.5sqmm',
        unit: '90m Coil',
        basePrice: 1800,
        gstRate: 18,
        hsnCode: '8544'
    },
    {
        name: 'Switch Socket',
        unit: 'Piece',
        basePrice: 85,
        gstRate: 18,
        hsnCode: '8536'
    }
];

const seedPresets = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI is not defined in .env');
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        console.log('Clearing existing presets...');
        await MaterialPreset.deleteMany({});
        
        console.log('Seeding new presets...');
        await MaterialPreset.insertMany(presets);
        
        console.log(`Successfully seeded ${presets.length} material presets.`);

        process.exit();
    } catch (error) {
        console.error('Error seeding presets:', error);
        process.exit(1);
    }
};

seedPresets();
