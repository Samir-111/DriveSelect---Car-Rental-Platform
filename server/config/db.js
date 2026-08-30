import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI || "mongodb://localhost:27017/car-rental";
        if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('car-rental')) {
            uri = `${process.env.MONGODB_URI.replace(/\/$/, '')}/car-rental`;
        }
        await mongoose.connect(uri);

        console.log("Database Connected");
    } catch (error) {
        console.log("Database Connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;