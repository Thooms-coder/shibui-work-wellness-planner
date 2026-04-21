"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthGuard } from "../../components/auth-guard";
import { FlashBanner } from "../../components/flash-banner";
import { getProfile, updateOnboarding } from "../../lib/api";
import { clearStoredToken, getStoredToken } from "../../lib/auth";
import type { Profile } from "../../lib/types";

const planningStyles = [
  "Structured and intense",
  "Balanced and sustainable",
  "Flexible and adaptive",
];

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingScreen />
    </AuthGuard>
  );
}

function OnboardingScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [timezone, setTimezone] = useState("America/New_York");
  const [workdayStartHour, setWorkdayStartHour] = useState("8");
  const [workdayEndHour, setWorkdayEndHour] = useState("17");
  const [movementDaysPerWeek, setMovementDaysPerWeek] = useState("4");
  const [planningStyle, setPlanningStyle] = useState(planningStyles[1]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProfile(authToken: string) {
      try {
        const data = await getProfile(authToken);
        setProfile(data);
        setTimezone(data.timezone);
        setWorkdayStartHour(String(data.preferences?.workday_start_hour ?? 8));
        setWorkdayEndHour(String(data.preferences?.workday_end_hour ?? 17));
        setMovementDaysPerWeek(String(data.preferences?.movement_days_per_week ?? 4));
        setPlanningStyle(data.preferences?.planning_style ?? planningStyles[1]);

        if (data.preferences?.onboarding_completed) {
          router.replace("/app");
          return;
        }
      } catch (err) {
        clearStoredToken();
        setError(err instanceof Error ? err.message : "Unable to load your profile.");
        router.replace("/login");
        return;
      } finally {
        setLoading(false);
      }
    }

    void loadProfile(token);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateOnboarding(token, {
        timezone,
        workday_start_hour: Number(workdayStartHour),
        workday_end_hour: Number(workdayEndHour),
        movement_days_per_week: Number(movementDaysPerWeek),
        planning_style: planningStyle,
      });
      setMessage("Onboarding saved.");
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save onboarding.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="status-shell">Loading your onboarding flow...</main>;
  }

  return (
    <main className="app-shell">
      {message ? (
        <FlashBanner message={message} onClose={() => setMessage(null)} tone="success" />
      ) : null}
      <section className="app-panel">
        <div className="topbar">
          <div className="brand-mark">Shibui</div>
          <div className="topbar-links">
            <button className="nav-link-item" onClick={() => router.push("/app")} type="button">
              Planner
            </button>
          </div>
        </div>

        <div className="panel-copy">
          <p className="eyebrow">Workspace Setup</p>
          <h1 className="panel-title">Set the rhythm Shibui should optimize around.</h1>
          <p className="panel-description">
            These defaults shape how your planner evaluates balance, recovery, and sustainable load
            across the week.
          </p>
        </div>

        <div className="onboarding-grid">
          <section className="callout planner-utility-card onboarding-main-card">
            <p className="callout-title">Planning defaults</p>
            <p className="callout-body utility-copy">
              Set the baseline for work windows, movement frequency, and the planning style you want
              the product to support.
            </p>

            <form className="form-grid planner-form-grid onboarding-form-grid" onSubmit={handleSubmit}>
              <label className="field">
                <span>Timezone</span>
                <input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
              </label>

              <label className="field">
                <span>Workday start hour</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={workdayStartHour}
                  onChange={(event) => setWorkdayStartHour(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Workday end hour</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={workdayEndHour}
                  onChange={(event) => setWorkdayEndHour(event.target.value)}
                />
              </label>

              <label className="field">
                <span>Movement days per week</span>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={movementDaysPerWeek}
                  onChange={(event) => setMovementDaysPerWeek(event.target.value)}
                />
              </label>

              <label className="field field-span">
                <span>Planning style</span>
                <select value={planningStyle} onChange={(event) => setPlanningStyle(event.target.value)}>
                  {planningStyles.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {error ? <p className="form-error field-span">{error}</p> : null}

              <div className="field-span inline-actions onboarding-actions">
                <button className="primary-button" disabled={saving} type="submit">
                  {saving ? "Saving..." : "Finish Onboarding"}
                </button>
                <button
                  className="ghost-button"
                  onClick={() => router.push("/app")}
                  type="button"
                >
                  Back to Planner
                </button>
              </div>
            </form>
          </section>

          <aside className="callout planner-secondary-card onboarding-side-card">
            <p className="callout-title">Workspace snapshot</p>
            <p className="callout-body utility-copy">
              A quick summary of the operating rhythm you are about to save as your default.
            </p>

            <div className="onboarding-summary">
              <div className="onboarding-summary-row">
                <span>Timezone</span>
                <strong>{timezone}</strong>
              </div>
              <div className="onboarding-summary-row">
                <span>Workday</span>
                <strong>
                  {workdayStartHour}:00 to {workdayEndHour}:00
                </strong>
              </div>
              <div className="onboarding-summary-row">
                <span>Movement</span>
                <strong>{movementDaysPerWeek} days per week</strong>
              </div>
              <div className="onboarding-summary-row">
                <span>Style</span>
                <strong>{planningStyle}</strong>
              </div>
            </div>

            <div className="onboarding-account">
              <p className="callout-title">Account</p>
              <p className="callout-body utility-copy">
                {profile?.full_name} ({profile?.email})
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
