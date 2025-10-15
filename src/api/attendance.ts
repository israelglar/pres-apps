const API_URL =
  "https://script.google.com/macros/s/AKfycbyBokQ6x8RyiH5kuDpNcbjmBEqhCVmOUMpdu8LzT9fKIDofyIa49FlgZZ960kPfqW0qNQ/exec";

const TIMEOUT_MS = 10000; // 10 second timeout

// Helper function to add timeout to fetch
async function fetchWithTimeout(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Get all attendance data
export async function getAttendance(): Promise<{
  success: boolean;
  dates: string[];
  lessonNames: Record<string, string>;
  students: Array<{ name: string; id: number }>;
}> {
  try {
    const response = await fetchWithTimeout(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return data;
      console.log(data);
    } else {
      throw new Error(data.message || "Failed to fetch attendance data");
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout. Please check your internet connection."
      );
    }
    if (!navigator.onLine) {
      throw new Error("No internet connection. Please check your network.");
    }
    throw new Error(
      error.message || "Failed to connect to server. Please try again."
    );
  }
}

// Bulk update attendance for multiple students at once
export async function bulkUpdateAttendance(
  records: Array<{ name: string; date: Date; status: string }>
) {
  try {
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "bulkUpdateAttendance",
        records: records.map((r) => ({
          name: r.name,
          date: r.date.toISOString(),
          status: r.status,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to update attendance");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request timeout. Please check your internet connection."
      );
    }
    if (!navigator.onLine) {
      throw new Error("No internet connection. Please check your network.");
    }
    throw new Error(
      error.message || "Failed to save attendance. Please try again."
    );
  }
}
