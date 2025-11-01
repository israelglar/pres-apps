/**
 * Populate Attendance Records Script
 *
 * Imports attendance records from Google Sheets "Presenças" sheet
 * Maps student names to database IDs and creates attendance records
 * Run with: npm run db:populate-attendance
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

interface AttendanceRecordData {
  studentName: string;
  date: string;
  status: "present" | "absent";
  serviceTimeId: number | null; // null for default service time
}

/**
 * Parse date from "Presenças" sheet format
 * Example: "12/10/25" -> "2025-10-12"
 */
function parseAttendanceDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  const fullYear = year.startsWith("2") ? `20${year}` : `20${year}`;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Parse attendance status
 * "P" = present
 * "P (9h)" = present at 9h service
 * "F" = absent (falta)
 * "" or null = not marked (skip)
 */
function parseAttendanceStatus(statusStr: string): {
  status: "present" | "absent" | null;
  serviceTimeId: number | null;
} {
  if (!statusStr || statusStr.trim() === "") {
    return { status: null, serviceTimeId: null };
  }

  const trimmed = statusStr.trim();

  if (trimmed === "F") {
    return { status: "absent", serviceTimeId: null };
  }

  if (trimmed === "P") {
    return { status: "present", serviceTimeId: null };
  }

  if (trimmed.includes("(9h)")) {
    return { status: "present", serviceTimeId: 1 }; // 9h service
  }

  // Default: treat as absent
  return { status: "absent", serviceTimeId: null };
}

/**
 * Fetch attendance records from Google Sheets
 */
async function fetchAttendanceRecords(): Promise<AttendanceRecordData[]> {
  console.log("📥 Fetching attendance records from Google Sheets...");

  // Raw data from "Presenças" sheet
  const rawData = [
    ["Nome", "F", "12/10/25", "19/10/25", "26/10/25"],
    ["Alice Lopes de Matos", "2", "F", "F", "P"],
    ["Alice Vieira Carvalho", "3", "P", "P", "F"],
    ["Ana Margarida Cerejo Brito", "1", "F", "P", "F"],
    ["Andrés James Jouk Ayeek", "2", "P", "P", "F"],
    ["Beatriz Oliveira", "0", "F", "F", "F"],
    ["Benjamin Miguel dos Santos Costa", "1", "P (9h)", "P", "P"],
    ["Catarina Oliveira", "0", "F", "F", "F"],
    ["Cristina Janeiro Cardoso", "1", "P", "F", "F"],
    ["Davi Mendes", "1", "F", "F", "F"],
    ["Duarte Carvalho de Menezes", "0", "F", "P", "P"],
    ["Eliana Sharp", "0", "F", "F", "F"],
    ["Eros Kasúmy de Carvalho Brito", "1", "P", "P", "P"],
    ["Gabriel Pedrosa", "2", "P", "F", "P"],
    ["Gabriel David Rodrigues ", "2", "P", "P", "P"],
    ["Guilherme Davyes Bernardo", "1", "P", "P", "P"],
    ["Guilherme Campos Borges de Brito Gomes", "2", "P", "P", "P"],
    ["Gustavo da Luz", "0", "F", "F", "P"],
    ["Isadora Barbosa de Andrade", "0", "", "F", "F"],
    ["Joel Omer ", "2", "P", "P", "F"],
    ["Jónatas Nunes Alves", "1", "F", "P", "F"],
    ["Lara Almeida Vieira", "1", "F", "F", "F"],
    ["Laura Maria Teixeira Barros", "1", "F", "P", "F"],
    ["Laura Batista Coutinho", "2", "P", "P", "P"],
    ["Leonor Paz Rodrigues", "1", "P", "P", "F"],
    ["Leonor Mealheiro", "2", "P", "F", "P"],
    ["Lia Costa Antunes", "1", "P", "P", "F"],
    ["Lukian Lekontsev", "1", "P", "P", "F"],
    ["Madalena Alves Calaim", "0", "F", "P", "P"],
    ["Madalena Valentim Pires", "1", "P", "P", "F"],
    ["Manuel Antunes Relvas Gonçalves Saraiva", "1", "F", "P", "F"],
    ["Maria Antunes Relvas Gonçalves Saraiva", "1", "F", "P", "F"],
    ["Maria Leonor de Castro Gonçalves", "1", "F", "F", "F"],
    ["Mateus Santos", "1", "", "F", "F"],
    ["Mel Magnus Rocha", "3", "P", "P", "F"],
    ["Moisés Fernandes Fragoso da Costa", "2", "P", "P", "F"],
    ["Nicolas Luca Azevedo Silva", "1", "P", "P", "F"],
    ["Nina de Moura Pereira", "1", "P", "P", "F"],
    ["Paulo Reginaldo Augusto Rodrigues de Gouveia", "2", "P", "P", "P"],
    ["Pedro Levi Rocha Fidalgo", "0", "F", "F", "F"],
    ["Pietro Di Tommaso Busto", "1", "P", "P", "P"],
    ["Salvador Pereira Nicho Santos Gomes", "1", "P", "P", "F"],
    ["Sarah Fidalgo", "0", "F", "F", "P"],
    ["Sofia Tavares", "", "", "", ""],
    ["Theo Valente Sampaio", "0", "F", "P", "P"],
    ["Victor Toledo Cassiano", "0", "F", "P", "P"],
    ["Yasmin Luana Nery Lobo", "1", "P", "P", "P"],
  ];

  // Parse header to get dates
  const header = rawData[0];
  const dateColumns = header.slice(2); // Skip "Nome" and "F" columns

  const records: AttendanceRecordData[] = [];

  // Process each student row (skip header)
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    const studentName = row[0]?.trim();

    if (!studentName || studentName === "# VISITAS") {
      continue; // Skip empty names or visitor section marker
    }

    // Process each date column
    dateColumns.forEach((dateStr, index) => {
      if (!dateStr) return;

      const date = parseAttendanceDate(dateStr);
      const statusStr = row[index + 2]; // +2 to skip "Nome" and "F" columns
      const { status, serviceTimeId } = parseAttendanceStatus(statusStr);

      if (status) {
        records.push({
          studentName,
          date,
          status,
          serviceTimeId,
        });
      }
    });
  }

  console.log(`✅ Parsed ${records.length} attendance records`);
  return records;
}

/**
 * Import attendance records into Supabase
 */
async function importAttendanceRecords(records: AttendanceRecordData[]) {
  console.log("\n📝 Importing attendance records to Supabase...");

  // 1. Fetch all students
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, name");

  if (studentsError) {
    console.error("❌ Error fetching students:", studentsError);
    throw studentsError;
  }

  const studentMap = new Map(students?.map((s) => [s.name, s.id]) || []);
  console.log(`   Found ${students?.length} students in database`);

  // 2. Fetch all service times
  const { data: serviceTimes, error: serviceTimesError } = await supabase
    .from("service_times")
    .select("id, name");

  if (serviceTimesError) {
    console.error("❌ Error fetching service times:", serviceTimesError);
    throw serviceTimesError;
  }

  const defaultServiceTimeId =
    serviceTimes?.find((st) => st.name === "11h")?.id || 2;
  const nineHourServiceTimeId =
    serviceTimes?.find((st) => st.name === "9h")?.id || 1;

  // 3. Fetch all schedules
  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select("id, date, service_time_id");

  console.log(schedules);

  if (schedulesError) {
    console.error("❌ Error fetching schedules:", schedulesError);
    throw schedulesError;
  }

  console.log(`   Found ${schedules?.length} schedules in database`);

  // 4. Create attendance records
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const notFoundStudents = new Set<string>();

  for (const record of records) {
    // Find student ID
    const studentId = studentMap.get(record.studentName);
    if (!studentId) {
      if (!notFoundStudents.has(record.studentName)) {
        console.log(`   ⚠️  Student not found: "${record.studentName}"`);
        notFoundStudents.add(record.studentName);
      }
      skipCount++;
      continue;
    }

    // Determine service time
    const serviceTimeId =
      record.serviceTimeId === 1 ? nineHourServiceTimeId : defaultServiceTimeId;

    // Find matching schedule
    const schedule = schedules?.find(
      (s) => s.date === record.date && s.service_time_id === serviceTimeId
    );

    if (!schedule) {
      // Schedule might not exist for this date - skip silently
      console.log(
        `   ⚠️  schedule doesnt exist for data ${record.date} ${serviceTimeId}`
      );
      skipCount++;
      continue;
    }

    // Create attendance record
    const attendanceRecord = {
      student_id: studentId,
      schedule_id: schedule.id,
      status: record.status,
      service_time_id: serviceTimeId,
      marked_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("attendance_records")
      .upsert([attendanceRecord], {
        onConflict: "student_id,schedule_id",
      });

    if (insertError) {
      console.error(
        `   ❌ Error inserting record for ${record.studentName} on ${record.date}:`,
        insertError
      );
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log(
    `\n✨ Import complete! ${successCount} records created, ${skipCount} skipped, ${errorCount} errors`
  );

  if (notFoundStudents.size > 0) {
    console.log(
      `\n⚠️  Students not found in database (${notFoundStudents.size}):`
    );
    notFoundStudents.forEach((name) => console.log(`   - ${name}`));
    console.log(
      "\n💡 Tip: Run the migration script first to import students from Google Sheets."
    );
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║               POPULATE ATTENDANCE RECORDS FROM GOOGLE SHEETS             ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

  try {
    const records = await fetchAttendanceRecords();
    await importAttendanceRecords(records);

    console.log("\n🎉 All done! Attendance records populated successfully.");
    console.log(
      "\n📊 Next steps: Check Supabase Table Editor to verify the data."
    );
  } catch (error) {
    console.error("\n❌ Failed to populate attendance records:", error);
    process.exit(1);
  }
}

// Run
main();
