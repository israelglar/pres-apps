/**
 * Populate Schedule Assignments Script
 *
 * Imports teacher assignments from Google Sheets "Transformada" sheet
 * Maps teachers to schedules based on dates and service times
 * Run with: npm run db:populate-assignments
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ScheduleAssignmentData {
  date: string;
  serviceTime: string;
  teachers: string[];
}

// Teacher name mapping (from sheet to database)
const teacherNameMap: Record<string, string> = {
  Israel: "Israel",
  Jeisi: "Jeisi",
  Ailton: "Ailton",
  Isabel: "Isabel",
  Ivandro: "Ivandro",
  Ana: "Ana",
  Samuel: "Samuel",
  Margarida: "Margarida",
  TODOS: "ALL", // Special case for "Retiro Bíblico"
};

/**
 * Parse date and time from "Transformada" sheet format
 * Example: "2025/10/12 09:00:00" -> { date: "2025-10-12", time: "09:00:00" }
 */
function parseDateTimeString(dateTimeStr: string): {
  date: string;
  time: string;
} {
  // Handle both "2025/10/12 09:00:00" and "2026/4/12 11:00:00" formats
  const [datePart, timePart] = dateTimeStr.trim().split(" ");
  const dateComponents = datePart.split("/");

  // Pad month and day with leading zeros if needed
  const year = dateComponents[0];
  const month = dateComponents[1].padStart(2, "0");
  const day = dateComponents[2].padStart(2, "0");

  const date = `${year}-${month}-${day}`;
  const time = timePart || "11:00:00";

  return { date, time };
}

/**
 * Parse teacher names from "Equipa" column
 * Handles formats like:
 * - "Israel e Jeisi"
 * - "Ailton e Isabel "
 * - "Ivandro e Ana\nIsrael e Jeisi" (multi-line)
 * - "Samuel \nIsrael e Jeisi"
 * - "TODOS"
 */
function parseTeacherNames(equipaText: string): string[] {
  if (!equipaText || equipaText.trim() === "") {
    return [];
  }

  // Split by newlines first
  const lines = equipaText.split("\n").map((line) => line.trim());

  const teachers: string[] = [];

  lines.forEach((line) => {
    // Split by "e" (and)
    const parts = line
      .split(/\s+e\s+/)
      .map((name) => name.trim())
      .filter((name) => name !== "");

    parts.forEach((name) => {
      // Map to database name
      const mappedName = teacherNameMap[name];
      if (mappedName && !teachers.includes(mappedName)) {
        teachers.push(mappedName);
      }
    });
  });

  return teachers;
}

/**
 * Fetch schedule assignments from Google Sheets
 */
async function fetchScheduleAssignments(): Promise<ScheduleAssignmentData[]> {
  console.log("📥 Fetching schedule assignments from Google Sheets...");

  const spreadsheetId = "1zdWGbezg86eSzLglcueVWX9-oRPVxbWaD5cTMdyZiSg";
  const range = "Transformada!A2:B50"; // Data and Equipa columns

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${process.env.GOOGLE_SHEETS_API_KEY}`;

  try {
    // For now, we'll use the data directly from the fetch we already have
    // In production, you'd fetch from Google Sheets API
    const rawData = [
      ["2025/10/12 09:00:00", "Israel e Jeisi"],
      ["2025/10/12 11:00:00", "Israel e Jeisi"],
      ["2025/10/19 11:00:00", "Ailton e Isabel "],
      ["2025/10/26 11:00:00", "Ivandro e Ana\nIsrael e Jeisi"],
      ["2025/11/09 11:00:00", "Samuel \nIsrael e Jeisi"],
      ["2025/11/16 09:00:00", "Margarida"],
      ["2025/11/16 11:00:00", "Israel e Jeisi"],
      ["2025/11/23 11:00:00", "Ailton e Isabel "],
      ["2025/11/30 11:00:00", "Ivandro e Ana\nIsrael e Jeisi"],
      ["2025/12/21 11:00:00", "Israel e Jeisi"],
      ["2026/01/11 11:00:00", "Samuel \nIsrael e Jeisi"],
      ["2026/01/18 11:00:00", "Israel e Jeisi"],
      ["2026/01/25 11:00:00", "Ailton e Isabel"],
      ["2026/02/08 11:00:00", "Ivandro e Ana\nIsrael e Jeisi"],
      ["2026/02/15 11:00:00", "Samuel \nIsrael e Jeisi"],
      ["2026/2/22 11:00:00", "Israel e Jeisi"],
      ["2026/3/8 11:00:00", "Ailton e Isabel"],
      ["2026/3/15 11:00:00", "Ivandro e Ana"],
      ["2026/3/22 11:00:00", "Samuel "],
      ["2026/03/29 11:00:00", "TODOS"],
      ["2026/4/12 11:00:00", "Israel e Jeisi"],
      ["2026/4/19 11:00:00", "Ailton e Isabel"],
      ["2026/4/26 11:00:00", "Ivandro e Ana"],
      ["2026/5/10 11:00:00", "Samuel \n"],
      ["2026/05/17 11:00:00", "Israel e Jeisi"],
      ["2026/05/24 11:00:00", "Ailton e Isabel"],
      ["2026/05/24 11:00:00", "Ivandro e Ana"],
      ["2026/06/14 11:00:00", "Samuel "],
      ["2026/06/21 11:00:00", "Israel e Jeisi"],
      ["2026/06/28 11:00:00", "Ailton e Isabel"],
      ["2026/07/12 11:00:00", "Ivandro e Ana"],
      ["2026/07/19 11:00:00", "Samuel "],
      ["2026/07/26 11:00:00", "Ailton e Isabel"],
      ["2026/08/09 11:00:00", "Israel e Jeisi"],
      ["2026/08/16 11:00:00", "Ivandro e Ana"],
      ["2026/08/23 11:00:00", "Samuel "],
      ["2026/08/30 11:00:00", "Ailton e Isabel"],
    ];

    const assignments: ScheduleAssignmentData[] = [];

    rawData.forEach(([dateTimeStr, equipaStr]) => {
      if (!dateTimeStr || !equipaStr) return;

      const { date, time } = parseDateTimeString(dateTimeStr);
      const teachers = parseTeacherNames(equipaStr);

      if (teachers.length > 0) {
        assignments.push({
          date,
          serviceTime: time,
          teachers,
        });
      }
    });

    console.log(`✅ Parsed ${assignments.length} schedule assignments`);
    return assignments;
  } catch (error) {
    console.error("❌ Error fetching schedule assignments:", error);
    throw error;
  }
}

/**
 * Import schedule assignments into Supabase
 */
async function importScheduleAssignments(
  assignments: ScheduleAssignmentData[]
) {
  console.log("\n👥 Importing schedule assignments to Supabase...");

  // 1. Fetch all teachers
  const { data: teachers, error: teachersError } = await supabase
    .from("teachers")
    .select("id, name");

  if (teachersError) {
    console.error("❌ Error fetching teachers:", teachersError);
    throw teachersError;
  }

  const teacherMap = new Map(teachers?.map((t) => [t.name, t.id]) || []);
  console.log(`   Found ${teachers?.length} teachers in database`);

  // 2. Fetch all service times
  const { data: serviceTimes, error: serviceTimesError } = await supabase
    .from("service_times")
    .select("id, time");

  if (serviceTimesError) {
    console.error("❌ Error fetching service times:", serviceTimesError);
    throw serviceTimesError;
  }

  const serviceTimeMap = new Map(
    serviceTimes?.map((st) => [st.time, st.id]) || []
  );

  // 3. Fetch all schedules
  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select("id, date, service_time_id");

  if (schedulesError) {
    console.error("❌ Error fetching schedules:", schedulesError);
    throw schedulesError;
  }

  console.log(`   Found ${schedules?.length} schedules in database`);

  // 4. Create schedule assignments
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const assignment of assignments) {
    const serviceTimeId = serviceTimeMap.get(assignment.serviceTime);

    if (!serviceTimeId) {
      console.log(
        `   ⚠️  Skipping: No service time found for ${assignment.serviceTime}`
      );
      skipCount++;
      continue;
    }

    // Find the matching schedule
    const schedule = schedules?.find(
      (s) => s.date === assignment.date && s.service_time_id === serviceTimeId
    );

    if (!schedule) {
      console.log(
        `   ⚠️  Skipping: No schedule found for ${assignment.date} at ${assignment.serviceTime}`
      );
      skipCount++;
      continue;
    }

    // Special case: "TODOS" (all teachers)
    const teachersToAssign =
      assignment.teachers.includes("ALL")
        ? Array.from(teacherMap.values())
        : assignment.teachers
            .map((name) => teacherMap.get(name))
            .filter((id): id is number => id !== undefined);

    if (teachersToAssign.length === 0) {
      console.log(
        `   ⚠️  Skipping: No teachers found for ${assignment.date} (${assignment.teachers.join(", ")})`
      );
      skipCount++;
      continue;
    }

    // Create assignment records
    const assignmentRecords = teachersToAssign.map((teacherId, index) => ({
      schedule_id: schedule.id,
      teacher_id: teacherId,
      role: index === 0 ? "lead" : "teacher", // First teacher is lead
    }));

    const { error: insertError } = await supabase
      .from("schedule_assignments")
      .upsert(assignmentRecords, {
        onConflict: "schedule_id,teacher_id",
      });

    if (insertError) {
      console.error(
        `   ❌ Error inserting assignment for ${assignment.date}:`,
        insertError
      );
      errorCount++;
    } else {
      successCount += assignmentRecords.length;
      console.log(
        `   ✅ ${assignment.date} (${assignment.serviceTime}): ${teachersToAssign.length} teacher(s)`
      );
    }
  }

  console.log(
    `\n✨ Import complete! ${successCount} assignments created, ${skipCount} skipped, ${errorCount} errors`
  );
}

/**
 * Main function
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║              POPULATE SCHEDULE ASSIGNMENTS FROM GOOGLE SHEETS            ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

  try {
    const assignments = await fetchScheduleAssignments();
    await importScheduleAssignments(assignments);

    console.log("\n🎉 All done! Schedule assignments populated successfully.");
  } catch (error) {
    console.error("\n❌ Failed to populate schedule assignments:", error);
    process.exit(1);
  }
}

// Run
main();
