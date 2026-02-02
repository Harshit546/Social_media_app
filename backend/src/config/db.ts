import mongoose from "mongoose"

// Validate MONGO_URI exists
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI environment variable is not set");
    console.error("Please create a .env file with MONGO_URI=your_mongodb_connection_string");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    })