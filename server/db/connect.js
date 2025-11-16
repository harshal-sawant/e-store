const mongoose = require("mongoose");

// Centralized connection helper. Mongoose >=6 ignores most legacy options; keep it minimal.
// Adds basic logging & rethrows on failure so caller can decide whether to proceed.
const connectDB = async (rawUrl) => {
  try {
    if (!rawUrl) {
      throw new Error("MONGO_URI is empty");
    }
    // Handle accidental prefix like 'MONGO_URL=' placed into value.
    let url = rawUrl.replace(/^MONGO_URL=/, "");
    // Mongoose 5.x needs these options to silence deprecation warnings.
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = connectDB;
