import type {
  AuthResponse,
  Profile,
  Reflection,
  ScheduledBlock,
  TaskTemplate,
  WeeklySummary,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let detail = "Request failed.";
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {
      // keep generic message
    }
    throw new ApiError(detail, response.status);
  }

  return (await response.json()) as T;
}

export async function signup(payload: {
  full_name: string;
  email: string;
  password: string;
  timezone: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function getProfile(token: string): Promise<Profile> {
  return request<Profile>("/profile/me", { token });
}

export async function updateOnboarding(
  token: string,
  payload: {
    timezone: string;
    workday_start_hour: number;
    workday_end_hour: number;
    movement_days_per_week: number;
    planning_style: string;
  },
): Promise<Profile> {
  return request<Profile>("/profile/onboarding", {
    method: "PUT",
    token,
    body: payload,
  });
}

export async function listTaskTemplates(token: string): Promise<TaskTemplate[]> {
  return request<TaskTemplate[]>("/planner/templates", { token });
}

export async function createTaskTemplate(
  token: string,
  payload: {
    name: string;
    category: "flow" | "motion";
    subcategory: string;
    default_duration_minutes: number;
    default_intensity: number;
  },
): Promise<TaskTemplate> {
  return request<TaskTemplate>("/planner/templates", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function listScheduledBlocks(token: string): Promise<ScheduledBlock[]> {
  return request<ScheduledBlock[]>("/planner/blocks", { token });
}

export async function updateScheduledBlock(
  token: string,
  blockId: number,
  payload: {
    task_template_id: number;
    starts_at: string;
    ends_at: string;
    planned_duration_minutes: number;
    intensity_override?: number | null;
    notes?: string | null;
    status: "pending" | "in_progress" | "completed";
  },
): Promise<ScheduledBlock> {
  return request<ScheduledBlock>(`/planner/blocks/${blockId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function deleteScheduledBlock(token: string, blockId: number): Promise<void> {
  await request<void>(`/planner/blocks/${blockId}`, {
    method: "DELETE",
    token,
  });
}

export async function createScheduledBlock(
  token: string,
  payload: {
    task_template_id: number;
    starts_at: string;
    ends_at: string;
    planned_duration_minutes: number;
    intensity_override?: number | null;
    notes?: string | null;
  },
): Promise<ScheduledBlock> {
  return request<ScheduledBlock>("/planner/blocks", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function createReflection(
  token: string,
  payload: {
    scheduled_block_id: number;
    mood_before?: number | null;
    mood_after?: number | null;
    actual_duration_minutes?: number | null;
    intensity?: number | null;
    notes?: string | null;
    reflected_at: string;
  },
): Promise<Reflection> {
  return request<Reflection>("/planner/reflections", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function listReflections(token: string): Promise<Reflection[]> {
  return request<Reflection[]>("/planner/reflections", { token });
}

export async function getWeeklySummary(token: string): Promise<WeeklySummary> {
  return request<WeeklySummary>("/planner/weekly-summary", { token });
}
