import mongoose from 'mongoose';
import dns from 'dns';

// Ensure SRV resolution succeeds across Windows/ISP networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fall back to default system DNS
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};
