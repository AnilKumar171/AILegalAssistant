const mongoose = require("mongoose");

let isConnected = false;

async function connectMongo() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  isConnected = true;
  mongoose.connection.on("disconnected", () => {
    isConnected = false;
  });
}

module.exports = { connectMongo };

