/**
 * Data Migration Script
 *
 * Migrates existing data from Google Sheets to Supabase
 * Run with: npm run db:migrate
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const googleSheetsApiUrl =
  "https://script.google.com/macros/s/AKfycbz-f51iHygWdwqBCJAentbbV-S50XZ8XvxE8JflZ9RiJpOCZPijit_u4-Iot6t59HYJpA/exec";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GoogleSheetsData {
  success: boolean;
  dates: string[];
  lessonNames: Record<string, string>;
  lessonLinks: Record<string, string>;
  students: Array<{ name: string; id?: number }>;
}

async function fetchGoogleSheetsData(): Promise<GoogleSheetsData> {
  console.log("📥 Fetching data from Google Sheets...");
  try {
    const response = await fetch(googleSheetsApiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(
      `✅ Fetched data for ${data.students?.length || 0} students and ${data.dates?.length || 0} dates`
    );
    return data;
  } catch (error) {
    console.error("❌ Error fetching Google Sheets data:", error);
    throw error;
  }
}

async function migrateStudents(students: Array<{ name: string }>) {
  console.log("\n👥 Migrating students...");
  try {
    const studentsToInsert = students.map((s) => ({
      name: s.name,
      is_visitor: false,
      status: "active",
    }));

    const { data, error } = await supabase
      .from("students")
      .upsert(studentsToInsert, {
        onConflict: "name",
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    console.log(`✅ Migrated ${data?.length || 0} students`);
    return data || [];
  } catch (error) {
    console.error("❌ Error migrating students:", error);
    throw error;
  }
}

async function migrateLessons(
  lessonNames: Record<string, string>,
  lessonLinks: Record<string, string>
) {
  console.log("\n📚 Migrating lessons...");
  try {
    // Extract unique lessons
    const uniqueLessons = new Map<
      string,
      { name: string; url: string | null }
    >();

    Object.entries(lessonNames).forEach(([date, name]) => {
      if (!uniqueLessons.has(name)) {
        uniqueLessons.set(name, {
          name,
          url: lessonLinks[date] || null,
        });
      }
    });

    const lessonsToInsert = Array.from(uniqueLessons.values()).map((lesson) => {
      // Parse curriculum series and lesson number from name
      // Example: "Q4 1. How Could a Loving God Let People Go To Hell?"
      const match = lesson.name.match(/^(Q\d+)\s+(\d+)\./);
      const curriculumSeries = match ? match[1] : null;
      const lessonNumber = match ? parseInt(match[2]) : null;

      return {
        name: lesson.name,
        resource_url: lesson.url,
        curriculum_series: curriculumSeries,
        lesson_number: lessonNumber,
        is_special_event: !curriculumSeries, // If no Q-series, it's a special event
      };
    });

    const { data, error } = await supabase
      .from("lessons")
      .upsert(lessonsToInsert, {
        onConflict: "name",
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    console.log(`✅ Migrated ${data?.length || 0} lessons`);
    return data || [];
  } catch (error) {
    console.error("❌ Error migrating lessons:", error);
    throw error;
  }
}

async function migrateSchedules(
  dates: string[],
  lessonNames: Record<string, string>,
  lessons: Array<{ id: number; name: string }>
) {
  console.log("\n📅 Migrating schedules...");
  try {
    // Get the default service time (11h)
    const { data: serviceTimes } = await supabase
      .from("service_times")
      .select("*")
      .eq("name", "11h")
      .single();

    if (!serviceTimes) {
      throw new Error("Service time 11h not found. Run db:setup first.");
    }

    const schedulesToInsert = dates.map((date) => {
      const lessonName = lessonNames[date];
      const lesson = lessons.find((l) => l.name === lessonName);

      return {
        date,
        service_time_id: serviceTimes.id,
        lesson_id: lesson?.id || null,
        event_type: "regular" as const,
        is_cancelled: false,
      };
    });

    const { data, error } = await supabase
      .from("schedules")
      .upsert(schedulesToInsert, {
        onConflict: "date,service_time_id",
        ignoreDuplicates: false,
      })
      .select();

    if (error) throw error;

    console.log(`✅ Migrated ${data?.length || 0} schedules`);
    return data || [];
  } catch (error) {
    console.error("❌ Error migrating schedules:", error);
    throw error;
  }
}

async function migrateData() {
  console.log("🚀 Starting data migration from Google Sheets to Supabase...\n");

  try {
    // 1. Fetch data from Google Sheets
    const sheetsData = await fetchGoogleSheetsData();

    // 2. Migrate students
    await migrateStudents(sheetsData.students);

    // 3. Migrate lessons
    const lessons = await migrateLessons(
      sheetsData.lessonNames,
      sheetsData.lessonLinks
    );

    // 4. Migrate schedules
    await migrateSchedules(sheetsData.dates, sheetsData.lessonNames, lessons);

    console.log("\n✨ Migration complete!");
    console.log("\n📊 Summary:");
    console.log(`   - Students: ${sheetsData.students.length}`);
    console.log(`   - Lessons: ${lessons.length}`);
    console.log(`   - Schedules: ${sheetsData.dates.length}`);
    console.log("\n⚠️  Note: Attendance records are NOT migrated.");
    console.log(
      "   Teachers will mark attendance going forward in the new system."
    );
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateData();
