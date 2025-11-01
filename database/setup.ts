/**
 * Database Setup Instructions
 *
 * This script provides instructions for setting up the database
 * Run with: npm run db:setup
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    DATABASE SETUP INSTRUCTIONS                           ║
╚══════════════════════════════════════════════════════════════════════════╝

📋 To set up your Supabase database, follow these steps:

1️⃣  Open your Supabase Dashboard:
   https://supabase.com/dashboard/project/${process.env.VITE_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.+?)\.supabase\.co/)?.[1] || "YOUR_PROJECT"}/sql

2️⃣  Copy the contents of database/schema.sql

3️⃣  Paste the SQL into the Supabase SQL Editor

4️⃣  Click "Run" to execute the SQL

📊 This will create:
   ✓ students table
   ✓ teachers table (with 8 teachers pre-populated)
   ✓ service_times table (9h and 11h pre-populated)
   ✓ lessons table
   ✓ schedules table
   ✓ schedule_assignments table
   ✓ attendance_records table

🔒 Security:
   ✓ Row Level Security (RLS) enabled
   ✓ Public access policies (for development, update later for auth)

📝 The SQL file is located at:
   ${path.resolve(__dirname, "schema.sql")}

After running the SQL, run the migration script to import data:
   npm run db:migrate

═══════════════════════════════════════════════════════════════════════════
`);

// Check if schema.sql exists
const schemaPath = path.resolve(__dirname, "schema.sql");
if (fs.existsSync(schemaPath)) {
  console.log("✅ schema.sql file found!\n");
  console.log(
    "Would you like to see the SQL contents? (Press Ctrl+C to cancel)\n"
  );
} else {
  console.error("❌ schema.sql file not found!");
  console.error("   Expected location:", schemaPath);
  process.exit(1);
}
