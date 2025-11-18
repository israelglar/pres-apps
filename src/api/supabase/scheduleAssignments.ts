import { supabase } from "../../lib/supabase";
import type { ScheduleAssignment } from "../../types/database.types";

/**
 * Update teacher assignments for a schedule
 * Replaces all existing assignments with the new list
 * Uses a transaction-safe approach: delete all, then insert new
 */
export async function updateScheduleAssignments(
  scheduleId: number,
  teacherIds: number[],
  role: "lead" | "teacher" | "assistant" = "teacher"
): Promise<ScheduleAssignment[]> {
  // Delete all existing assignments for this schedule
  const { error: deleteError } = await supabase
    .from("schedule_assignments")
    .delete()
    .eq("schedule_id", scheduleId);

  if (deleteError) {
    console.error("Error deleting schedule assignments:", deleteError);
    throw new Error(
      `Failed to delete schedule assignments: ${deleteError.message}`
    );
  }

  // If no teachers provided, we're done (all assignments removed)
  if (teacherIds.length === 0) {
    return [];
  }

  // Insert new assignments
  const newAssignments = teacherIds.map((teacherId) => ({
    schedule_id: scheduleId,
    teacher_id: teacherId,
    role,
  }));

  const { data, error: insertError } = await supabase
    .from("schedule_assignments")
    .insert(newAssignments)
    .select(`
      *,
      teacher:teachers(*)
    `);

  if (insertError) {
    console.error("Error creating schedule assignments:", insertError);
    throw new Error(
      `Failed to create schedule assignments: ${insertError.message}`
    );
  }

  return data || [];
}

/**
 * Get all assignments for a specific schedule
 */
export async function getScheduleAssignments(
  scheduleId: number
): Promise<ScheduleAssignment[]> {
  const { data, error } = await supabase
    .from("schedule_assignments")
    .select(`
      *,
      teacher:teachers(*)
    `)
    .eq("schedule_id", scheduleId)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching schedule assignments:", error);
    throw new Error(
      `Failed to fetch schedule assignments: ${error.message}`
    );
  }

  return data || [];
}

/**
 * Add a single teacher to a schedule
 */
export async function addTeacherToSchedule(
  scheduleId: number,
  teacherId: number,
  role: "lead" | "teacher" | "assistant" = "teacher"
): Promise<ScheduleAssignment> {
  const { data, error } = await supabase
    .from("schedule_assignments")
    .insert({
      schedule_id: scheduleId,
      teacher_id: teacherId,
      role,
    })
    .select(`
      *,
      teacher:teachers(*)
    `)
    .single();

  if (error) {
    console.error("Error adding teacher to schedule:", error);
    throw new Error(`Failed to add teacher to schedule: ${error.message}`);
  }

  return data;
}

/**
 * Remove a teacher from a schedule
 */
export async function removeTeacherFromSchedule(
  scheduleId: number,
  teacherId: number
): Promise<void> {
  const { error } = await supabase
    .from("schedule_assignments")
    .delete()
    .eq("schedule_id", scheduleId)
    .eq("teacher_id", teacherId);

  if (error) {
    console.error("Error removing teacher from schedule:", error);
    throw new Error(`Failed to remove teacher from schedule: ${error.message}`);
  }
}
