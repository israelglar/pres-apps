import { supabase } from "../../lib/supabase";
import type { ServiceTime } from "../../schemas/attendance.schema";

/**
 * Get all active service times from the database
 * Returns service times ordered by display_order
 */
export async function getActiveServiceTimes(): Promise<ServiceTime[]> {
  const { data, error } = await supabase
    .from("service_times")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching service times:", error);
    throw new Error(`Failed to fetch service times: ${error.message}`);
  }

  return data || [];
}
