"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthGuard } from "../../components/auth-guard";
import { FlashBanner } from "../../components/flash-banner";
import {
  createReflection,
  createScheduledBlock,
  createTaskTemplate,
  deleteScheduledBlock,
  getProfile,
  getWeeklySummary,
  listReflections,
  listScheduledBlocks,
  listTaskTemplates,
  updateScheduledBlock,
} from "../../lib/api";
import { clearStoredToken, getStoredToken } from "../../lib/auth";
import type {
  Profile,
  Reflection,
  ScheduledBlock,
  TaskTemplate,
  WeeklySummary,
} from "../../lib/types";

export default function AppHomePage() {
  return (
    <AuthGuard>
      <AppScreen />
    </AuthGuard>
  );
}

function AppScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [blocks, setBlocks] = useState<ScheduledBlock[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<"flow" | "motion">("flow");
  const [templateSubcategory, setTemplateSubcategory] = useState("");
  const [templateDuration, setTemplateDuration] = useState("60");
  const [templateIntensity, setTemplateIntensity] = useState("6");

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [blockDate, setBlockDate] = useState(getTodayDate());
  const [blockTime, setBlockTime] = useState("09:00");
  const [blockDuration, setBlockDuration] = useState("60");
  const [blockIntensity, setBlockIntensity] = useState("");
  const [blockNotes, setBlockNotes] = useState("");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockStatus, setBlockStatus] = useState<"pending" | "in_progress" | "completed">("pending");

  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [moodBefore, setMoodBefore] = useState("5");
  const [moodAfter, setMoodAfter] = useState("7");
  const [actualDuration, setActualDuration] = useState("60");
  const [reflectionIntensity, setReflectionIntensity] = useState("6");
  const [reflectionNotes, setReflectionNotes] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadProfile(authToken: string) {
      try {
        const [profileData, templatesData, blocksData, reflectionsData, summaryData] = await Promise.all([
          getProfile(authToken),
          listTaskTemplates(authToken),
          listScheduledBlocks(authToken),
          listReflections(authToken),
          getWeeklySummary(authToken),
        ]);

        const sortedBlocks = [...blocksData].sort(
          (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
        );

        setProfile(profileData);
        setTemplates(templatesData);
        setBlocks(sortedBlocks);
        setReflections(reflectionsData);
        setSummary(summaryData);

        if (templatesData.length > 0) {
          const firstTemplate = templatesData[0];
          setSelectedTemplateId(String(firstTemplate.id));
          setBlockDuration(String(firstTemplate.default_duration_minutes));
          setBlockIntensity(String(firstTemplate.default_intensity));
        }

        const blockWithoutReflection = sortedBlocks.find((block) => block.status !== "completed");
        if (blockWithoutReflection) {
          setSelectedBlockId(String(blockWithoutReflection.id));
          setActualDuration(String(blockWithoutReflection.planned_duration_minutes));
        }

        if (!profileData.preferences?.onboarding_completed) {
          router.replace("/onboarding");
          return;
        }
      } catch (err) {
        clearStoredToken();
        setError(err instanceof Error ? err.message : "Unable to load your workspace.");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile(token);
  }, [router]);

  function syncSelectedTemplate(templateList: TaskTemplate[], templateId: number) {
    const template = templateList.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    setSelectedTemplateId(String(template.id));
    setBlockDuration(String(template.default_duration_minutes));
    setBlockIntensity(String(template.default_intensity));
  }

  async function refreshPlannerData(token: string) {
    const [templatesData, blocksData, reflectionsData, summaryData] = await Promise.all([
      listTaskTemplates(token),
      listScheduledBlocks(token),
      listReflections(token),
      getWeeklySummary(token),
    ]);

    const sortedBlocks = [...blocksData].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );

    setTemplates(templatesData);
    setBlocks(sortedBlocks);
    setReflections(reflectionsData);
    setSummary(summaryData);

    if (templatesData.length > 0 && !selectedTemplateId) {
      syncSelectedTemplate(templatesData, templatesData[0].id);
    }

    const reflectableBlock = sortedBlocks.find((block) => block.status !== "completed");
    if (reflectableBlock) {
      setSelectedBlockId(String(reflectableBlock.id));
      setActualDuration(String(reflectableBlock.planned_duration_minutes));
    }
  }

  async function handleCreateTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setTemplateError(null);
    setMessage(null);
    try {
      const created = await createTaskTemplate(token, {
        name: templateName,
        category: templateCategory,
        subcategory: templateSubcategory,
        default_duration_minutes: Number(templateDuration),
        default_intensity: Number(templateIntensity),
      });

      const nextTemplates = [...templates, created].sort((a, b) => a.name.localeCompare(b.name));
      setTemplates(nextTemplates);
      syncSelectedTemplate(nextTemplates, created.id);
      setTemplateName("");
      setTemplateSubcategory("");
      setMessage("Task template saved.");
      await refreshPlannerData(token);
    } catch (err) {
      setTemplateError(err instanceof Error ? err.message : "Unable to create template.");
    }
  }

  async function handleCreateBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setBlockError(null);
    setMessage(null);
    try {
      const startsAt = toIsoDateTime(blockDate, blockTime);
      const endsAt = new Date(new Date(startsAt).getTime() + Number(blockDuration) * 60000).toISOString();

      const payload = {
        task_template_id: Number(selectedTemplateId),
        starts_at: startsAt,
        ends_at: endsAt,
        planned_duration_minutes: Number(blockDuration),
        intensity_override: blockIntensity ? Number(blockIntensity) : null,
        notes: blockNotes || null,
        status: blockStatus,
      } as const;

      if (editingBlockId) {
        await updateScheduledBlock(token, Number(editingBlockId), payload);
      } else {
        await createScheduledBlock(token, payload);
      }

      setBlockNotes("");
      setEditingBlockId(null);
      setBlockStatus("pending");
      setMessage(editingBlockId ? "Task updated." : "Task scheduled.");
      await refreshPlannerData(token);
    } catch (err) {
      setBlockError(
        err instanceof Error
          ? err.message
          : editingBlockId
            ? "Unable to update block."
            : "Unable to create block.",
      );
    }
  }

  async function handleCreateReflection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setReflectionError(null);
    setMessage(null);
    try {
      await createReflection(token, {
        scheduled_block_id: Number(selectedBlockId),
        mood_before: Number(moodBefore),
        mood_after: Number(moodAfter),
        actual_duration_minutes: Number(actualDuration),
        intensity: Number(reflectionIntensity),
        notes: reflectionNotes || null,
        reflected_at: new Date().toISOString(),
      });

      setReflectionNotes("");
      setMessage("Reflection saved.");
      await refreshPlannerData(token);
    } catch (err) {
      setReflectionError(err instanceof Error ? err.message : "Unable to save reflection.");
    }
  }

  const templateMap = new Map(templates.map((template) => [template.id, template]));
  const upcomingBlocks = blocks.slice().reverse();
  const reflectableBlocks = blocks.filter((block) => block.status !== "completed");
  const reflectionMap = new Map(reflections.map((reflection) => [reflection.scheduled_block_id, reflection]));
  const plannerCards = upcomingBlocks.slice(0, 6);
  const nextBlock = upcomingBlocks[0];
  const nextTemplate = nextBlock ? templateMap.get(nextBlock.task_template_id) : null;

  function startEditingBlock(block: ScheduledBlock) {
    const blockStart = new Date(block.starts_at);
    setEditingBlockId(String(block.id));
    setSelectedTemplateId(String(block.task_template_id));
    setBlockDate(blockStart.toISOString().slice(0, 10));
    setBlockTime(toTimeValue(block.starts_at));
    setBlockDuration(String(block.planned_duration_minutes));
    setBlockIntensity(block.intensity_override ? String(block.intensity_override) : "");
    setBlockNotes(block.notes ?? "");
    setBlockStatus(
      block.status === "in_progress" || block.status === "completed" ? block.status : "pending",
    );
  }

  async function handleDeleteBlock(blockId: number) {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setBlockError(null);
    setMessage(null);
    try {
      await deleteScheduledBlock(token, blockId);
      if (editingBlockId === String(blockId)) {
        setEditingBlockId(null);
        setBlockNotes("");
        setBlockStatus("pending");
      }
      setMessage("Task deleted.");
      await refreshPlannerData(token);
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : "Unable to delete block.");
    }
  }

  return (
    <main className="app-shell">
      {message ? (
        <FlashBanner message={message} onClose={() => setMessage(null)} tone="info" />
      ) : null}
      <section className="app-panel">
        <div className="topbar">
          <div className="brand-mark">Shibui</div>
          <div className="topbar-links">
            <Link className="nav-link-item flow-active" href="/app">
              Flow
            </Link>
            <Link className="nav-link-item motion-active" href="/app">
              Motion
            </Link>
            <Link className="nav-link-item" href="/onboarding">
              Profile
            </Link>
          </div>
        </div>

        <div className="app-topline">
          <div>
            <p className="eyebrow">Planner</p>
            <h1 className="panel-title">Your Daily Planner</h1>
          </div>
          <button
            className="ghost-button"
            onClick={() => {
              clearStoredToken();
              router.push("/login");
            }}
            type="button"
          >
            Log Out
          </button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {loading ? (
          <p className="muted-line">Loading workspace...</p>
        ) : profile ? (
          <>
            <div className="planner-header">
              <div className="planner-heading-row">
                <h2 className="planner-title">Your Daily Planner</h2>
                <Link className="ghost-button link-button" href="/onboarding">
                  Home
                </Link>
              </div>

              <div className="balance-bar">
                <span className="balance-label">Balance Score:</span>
                <span className="balance-badge">
                  {summary?.balance_score !== null && summary?.balance_score !== undefined
                    ? summary.balance_score
                    : "NA"}
                </span>
              </div>
            </div>

            <div className="stats-grid planner-stats-grid">
              <article className="stat-card">
                <p className="stat-label">Flow Minutes</p>
                <p className="stat-value">{summary?.flow_minutes ?? 0}</p>
                <p className="stat-meta">Scheduled focus work</p>
              </article>

              <article className="stat-card">
                <p className="stat-label">Motion Minutes</p>
                <p className="stat-value">{summary?.motion_minutes ?? 0}</p>
                <p className="stat-meta">Movement and recovery</p>
              </article>

              <article className="stat-card">
                <p className="stat-label">Completed</p>
                <p className="stat-value">{summary?.completed_blocks ?? 0}</p>
                <p className="stat-meta">{profile.preferences?.planning_style ?? "Planner active"}</p>
              </article>
            </div>

            <section className="planner-focus-banner">
              <div>
                <p className="planner-focus-label">Next Focus</p>
                <h3 className="planner-focus-title">
                  {nextTemplate?.name ?? "Shape your next block"}
                </h3>
                <p className="planner-focus-copy">
                  {nextBlock
                    ? `${formatDateTime(nextBlock.starts_at)} · ${nextBlock.planned_duration_minutes} min · ${formatStatus(nextBlock.status)}`
                    : "No scheduled blocks yet. Save a Flow or Motion template, then place it on your planner."}
                </p>
              </div>
              <div className="planner-focus-meta">
                <span className="planner-focus-chip">
                  {nextTemplate?.category ? formatStatus(nextTemplate.category) : "Planner Ready"}
                </span>
                <span className="planner-focus-chip planner-focus-chip-soft">
                  {profile.preferences?.planning_style ?? "Balanced rhythm"}
                </span>
              </div>
            </section>

            <section className="planner-section">
              {plannerCards.length === 0 ? (
                <article className="planner-empty-state">
                  <p className="planner-empty-kicker">Nothing scheduled yet</p>
                  <h3 className="planner-empty-title">Build your first Flow or Motion rhythm.</h3>
                  <p className="planner-empty-copy">
                    Start with a reusable template, then schedule a block and log a reflection once it is complete.
                  </p>
                </article>
              ) : (
                plannerCards.map((block) => {
                  const template = templateMap.get(block.task_template_id);
                  const reflection = reflectionMap.get(block.id);
                  const isFlow = template?.category === "flow";

                  return (
                    <article
                      className={`planner-card ${isFlow ? "planner-card-flow" : "planner-card-motion"}`}
                      key={block.id}
                    >
                      <div className="planner-card-body">
                        <h5 className="planner-card-title">
                          {template?.name ?? `Template ${block.task_template_id}`}
                          <span className="planner-badge">{isFlow ? "Flow" : "Motion"}</span>
                        </h5>

                        <p className="planner-card-copy">
                          <strong>Subcategory:</strong> {template?.subcategory ?? "No subcategory"} <br />
                          <strong>Status:</strong> {formatStatus(block.status)}
                        </p>

                        <p className="planner-card-copy">
                          <strong>Duration:</strong> {block.actual_duration_minutes ?? block.planned_duration_minutes} min <br />
                          <strong>Intensity:</strong>{" "}
                          {reflection?.intensity ?? block.intensity_override ?? template?.default_intensity ?? "—"}
                        </p>

                        <div className="mood-strip">
                          <div className="mood-line">
                            <span>Mood Before</span>
                            <strong>{reflection?.mood_before ?? "—"}</strong>
                          </div>
                          <div className="mood-track">
                            <div
                              className="mood-fill mood-before-fill"
                              style={{ width: `${(((reflection?.mood_before ?? 5) - 1) / 9) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="mood-strip">
                          <div className="mood-line">
                            <span>Mood After</span>
                            <strong>{reflection?.mood_after ?? "—"}</strong>
                          </div>
                          <div className="mood-track">
                            <div
                              className="mood-fill mood-after-fill"
                              style={{ width: `${(((reflection?.mood_after ?? 5) - 1) / 9) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="inline-actions planner-card-actions">
                          <button
                            className="ghost-button"
                            disabled={Boolean(reflection)}
                            onClick={() => startEditingBlock(block)}
                            type="button"
                          >
                            Edit Task
                          </button>
                          <button
                            className="ghost-button danger-button"
                            onClick={() => void handleDeleteBlock(block.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <div className="workspace-grid">
              <section className="callout planner-utility-card planner-utility-flow">
                <p className="callout-title">Create task template</p>
                <p className="callout-body utility-copy">
                  Build reusable Flow and Motion blocks so the planner stays quick to use.
                </p>
                <form className="form-stack compact-stack planner-form-stack" onSubmit={handleCreateTemplate}>
                  <label className="field">
                    <span>Name</span>
                    <input
                      value={templateName}
                      onChange={(event) => setTemplateName(event.target.value)}
                      placeholder="Deep focus sprint"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Category</span>
                    <select
                      value={templateCategory}
                      onChange={(event) =>
                        setTemplateCategory(event.target.value as "flow" | "motion")
                      }
                    >
                      <option value="flow">Flow</option>
                      <option value="motion">Motion</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Subcategory</span>
                    <input
                      value={templateSubcategory}
                      onChange={(event) => setTemplateSubcategory(event.target.value)}
                      placeholder="Deep Work"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Default duration</span>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={templateDuration}
                      onChange={(event) => setTemplateDuration(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Default intensity</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={templateIntensity}
                      onChange={(event) => setTemplateIntensity(event.target.value)}
                      required
                    />
                  </label>

                  {templateError ? <p className="form-error">{templateError}</p> : null}

                  <button className="primary-button" type="submit">
                    Save Template
                  </button>
                </form>
              </section>

              <section className="callout planner-utility-card planner-utility-flow">
                <p className="callout-title">{editingBlockId ? "Edit block" : "Schedule block"}</p>
                <p className="callout-body utility-copy">
                  Place your next work or movement block directly onto the daily planner.
                </p>
                <form className="form-stack compact-stack planner-form-stack" onSubmit={handleCreateBlock}>
                  <label className="field">
                    <span>Template</span>
                    <select
                      value={selectedTemplateId}
                      onChange={(event) => {
                        const nextId = Number(event.target.value);
                        setSelectedTemplateId(event.target.value);
                        syncSelectedTemplate(templates, nextId);
                      }}
                      required
                    >
                      <option value="" disabled>
                        Select a template
                      </option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                            {template.name} · {template.category}
                          </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Date</span>
                    <input
                      type="date"
                      value={blockDate}
                      onChange={(event) => setBlockDate(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Start time</span>
                    <input
                      type="time"
                      value={blockTime}
                      onChange={(event) => setBlockTime(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Duration</span>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={blockDuration}
                      onChange={(event) => setBlockDuration(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Intensity override</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={blockIntensity}
                      onChange={(event) => setBlockIntensity(event.target.value)}
                      placeholder="Optional"
                    />
                  </label>

                  <label className="field">
                    <span>Notes</span>
                    <input
                      value={blockNotes}
                      onChange={(event) => setBlockNotes(event.target.value)}
                      placeholder="Optional note for this block"
                    />
                  </label>

                  <label className="field">
                    <span>Status</span>
                    <select
                      value={blockStatus}
                      onChange={(event) =>
                        setBlockStatus(event.target.value as "pending" | "in_progress" | "completed")
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>

                  {blockError ? <p className="form-error">{blockError}</p> : null}

                  <div className="inline-actions">
                    <button className="primary-button" disabled={templates.length === 0} type="submit">
                      {editingBlockId ? "Save Changes" : "Schedule Block"}
                    </button>
                    {editingBlockId ? (
                      <button
                        className="ghost-button"
                        onClick={() => {
                          setEditingBlockId(null);
                          setBlockStatus("pending");
                          setBlockNotes("");
                        }}
                        type="button"
                      >
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="callout planner-utility-card planner-utility-motion">
                <p className="callout-title">Log reflection</p>
                <p className="callout-body utility-copy">
                  Capture mood and intensity changes so the balance score means something real.
                </p>
                <form className="form-stack compact-stack planner-form-stack" onSubmit={handleCreateReflection}>
                  <label className="field">
                    <span>Block</span>
                    <select
                      value={selectedBlockId}
                      onChange={(event) => setSelectedBlockId(event.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a block
                      </option>
                      {reflectableBlocks.map((block) => {
                        const template = templateMap.get(block.task_template_id);
                        return (
                          <option key={block.id} value={block.id}>
                            {template?.name ?? `Template ${block.task_template_id}`} · {formatDateTime(block.starts_at)}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label className="field">
                    <span>Mood before</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={moodBefore}
                      onChange={(event) => setMoodBefore(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Mood after</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={moodAfter}
                      onChange={(event) => setMoodAfter(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Actual duration</span>
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={actualDuration}
                      onChange={(event) => setActualDuration(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Intensity</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={reflectionIntensity}
                      onChange={(event) => setReflectionIntensity(event.target.value)}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Notes</span>
                    <input
                      value={reflectionNotes}
                      onChange={(event) => setReflectionNotes(event.target.value)}
                      placeholder="What shifted after the block?"
                    />
                  </label>

                  {reflectionError ? <p className="form-error">{reflectionError}</p> : null}

                  <button
                    className="primary-button"
                    disabled={reflectableBlocks.length === 0}
                    type="submit"
                  >
                    Save Reflection
                  </button>
                </form>
              </section>
            </div>

            <section className="callout planner-secondary-card">
              <p className="callout-title">Scheduled blocks</p>
              <p className="callout-body utility-copy">
                Your queue stays here so edits, status changes, and deletions are all one step away.
              </p>
              <div className="list-stack">
                {upcomingBlocks.length === 0 ? (
                  <div className="list-empty-state">
                    <p className="list-empty-title">No blocks scheduled yet.</p>
                    <p className="list-empty-copy">Create a template and place your first block on the planner.</p>
                  </div>
                ) : (
                  upcomingBlocks.map((block) => {
                    const template = templateMap.get(block.task_template_id);
                    return (
                      <article className="list-card" key={block.id}>
                        <div>
                          <p className="list-title">{template?.name ?? `Template ${block.task_template_id}`}</p>
                          <p className="list-meta">
                            {template?.category ?? "unknown"} · {template?.subcategory ?? "No subcategory"}
                          </p>
                        </div>
                        <div>
                          <p className="list-time">{formatDateTime(block.starts_at)}</p>
                          <p className="list-meta">
                            {block.planned_duration_minutes} min · status: {block.status}
                          </p>
                          <div className="inline-actions list-actions">
                            <button
                              className="ghost-button"
                              disabled={Boolean(reflectionMap.get(block.id))}
                              onClick={() => startEditingBlock(block)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="ghost-button danger-button"
                              onClick={() => void handleDeleteBlock(block.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <section className="callout planner-secondary-card">
              <p className="callout-title">Reflection history</p>
              <p className="callout-body utility-copy">
                Reflections help the balance score reflect how your schedule actually felt in practice.
              </p>
              <div className="list-stack">
                {reflections.length === 0 ? (
                  <div className="list-empty-state">
                    <p className="list-empty-title">No reflections logged yet.</p>
                    <p className="list-empty-copy">Complete a block and record your mood shift to start building history.</p>
                  </div>
                ) : (
                  reflections.map((reflection) => {
                    const block = blocks.find((item) => item.id === reflection.scheduled_block_id);
                    const template = block ? templateMap.get(block.task_template_id) : undefined;
                    return (
                      <article className="list-card" key={reflection.id}>
                        <div>
                          <p className="list-title">{template?.name ?? `Block ${reflection.scheduled_block_id}`}</p>
                          <p className="list-meta">
                            mood {reflection.mood_before ?? "NA"} to {reflection.mood_after ?? "NA"} · intensity{" "}
                            {reflection.intensity ?? "NA"}
                          </p>
                        </div>
                        <div>
                          <p className="list-time">{formatDateTime(reflection.reflected_at)}</p>
                          <p className="list-meta">
                            {reflection.actual_duration_minutes ?? block?.planned_duration_minutes ?? "NA"} min
                            {reflection.notes ? ` · ${reflection.notes}` : ""}
                          </p>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>

            <div className="inline-actions">
              <Link className="primary-button link-button" href="/onboarding">
                Edit Onboarding
              </Link>
              <a
                className="ghost-button link-button"
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
              >
                Open API Docs
              </a>
            </div>
          </>
        ) : (
          <p className="muted-line">Unable to load workspace data.</p>
        )}
      </section>
    </main>
  );
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatus(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function toTimeValue(value: string): string {
  const date = new Date(value);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}
