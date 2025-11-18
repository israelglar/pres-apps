import { supabase } from "../../lib/supabase";
import type { Teacher } from "../../types/database.types";

/**
 * Fetch all active teachers from the database
 * Used for teacher filters and assignment management
 */
export async function getAllTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching teachers:", error);
    throw new Error(`Failed to fetch teachers: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single teacher by ID
 */
export async function getTeacherById(id: number): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching teacher:", error);
    throw new Error(`Failed to fetch teacher: ${error.message}`);
  }

  return data;
}

/**
 * Fetch a teacher by their auth user ID
 * Used for tracking who marked attendance
 */
export async function getTeacherByAuthId(
  authUserId: string
): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (error) {
    // Not an error if teacher not found (might be a new user)
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching teacher by auth ID:", error);
    throw new Error(`Failed to fetch teacher: ${error.message}`);
  }

  return data;
}
