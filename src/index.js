import dns from 'node:dns'; 
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config'; 
import connectDB from "./db/db.js";

connectDB();