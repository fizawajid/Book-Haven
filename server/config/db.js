const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://fizawajid001:3dYoamdOQnqWYmvb@cluster0.jvkgnib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("MongoDB Connected!");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = connectDB;
