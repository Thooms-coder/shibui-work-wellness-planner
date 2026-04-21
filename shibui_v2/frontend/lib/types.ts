export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export type AuthResponse = {
  user: User;
  token: AuthToken;
};

export type UserPreferences = {
  workday_start_hour: number | null;
  workday_end_hour: number | null;
  movement_days_per_week: number | null;
  planning_style: string | null;
  onboarding_completed: boolean;
};

export type Profile = User & {
  preferences: UserPreferences | null;
};

export type TaskTemplate = {
  id: number;
  name: string;
  category: "flow" | "motion";
  subcategory: string;
  default_duration_minutes: number;
  default_intensity: number;
};

export type ScheduledBlock = {
  id: number;
  task_template_id: number;
  status: string;
  starts_at: string;
  ends_at: string;
  planned_duration_minutes: number;
  actual_duration_minutes: number | null;
  intensity_override: number | null;
  notes: string | null;
};

export type Reflection = {
  id: number;
  scheduled_block_id: number;
  mood_before: number | null;
  mood_after: number | null;
  actual_duration_minutes: number | null;
  intensity: number | null;
  notes: string | null;
  reflected_at: string;
};

export type WeeklySummary = {
  flow_minutes: number;
  motion_minutes: number;
  completed_blocks: number;
  balance_score: number | null;
};
