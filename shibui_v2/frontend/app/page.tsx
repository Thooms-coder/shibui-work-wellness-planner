import Link from "next/link";

export default function HomePage() {
  return (
    <main className="app-shell">
      <section className="app-panel landing-panel">
        <div className="topbar">
          <div className="brand-mark">Shibui</div>
          <div className="inline-actions compact-actions">
            <Link className="nav-button" href="/login">
              Log In
            </Link>
          </div>
        </div>

        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="eyebrow">Planning For Sustainable Performance</p>
            <h1>Plan output, recovery, and reflection in one calm operating system.</h1>
            <p className="lede">
              Shibui helps high-agency people structure deep work, movement, and review in one
              place, so their week stays effective under real pressure instead of collapsing into
              overload.
            </p>

            <div className="landing-proof-strip">
              <span className="landing-proof-pill">Flow templates</span>
              <span className="landing-proof-pill">Motion scheduling</span>
              <span className="landing-proof-pill">Reflection history</span>
            </div>

            <div className="inline-actions">
              <Link className="primary-button link-button" href="/signup">
                Start Free
              </Link>
              <Link className="ghost-button link-button" href="/login">
                Log In
              </Link>
            </div>

            <div className="landing-micro-stats">
              <article className="landing-micro-stat">
                <p className="landing-micro-label">Built for</p>
                <p className="landing-micro-value">Founders, operators, and self-directed professionals</p>
              </article>
              <article className="landing-micro-stat">
                <p className="landing-micro-label">Measures</p>
                <p className="landing-micro-value">Focus quality, movement volume, and energy shifts</p>
              </article>
            </div>
          </div>

          <div className="landing-preview-stack">
            <section className="callout planner-utility-card landing-preview-card">
              <div className="landing-preview-head">
                <div>
                  <p className="callout-title">Weekly balance preview</p>
                  <p className="callout-body landing-preview-copy">
                    Flow and Motion stay visible together, so planning for output never comes at
                    the expense of recovery.
                  </p>
                </div>
                <div className="mode-pills">
                  <span className="mode-pill flow-pill">Flow</span>
                  <span className="mode-pill motion-pill">Motion</span>
                </div>
              </div>

              <div className="landing-preview-grid">
                <article className="landing-preview-panel landing-preview-panel-flow">
                  <p className="landing-preview-label">Flow</p>
                  <h3 className="landing-preview-title">Deep Focus Sprint</h3>
                  <p className="landing-preview-meta">90 min · intensity 7 · morning block</p>
                  <div className="landing-preview-bar">
                    <div className="landing-preview-fill landing-preview-fill-flow" />
                  </div>
                </article>

                <article className="landing-preview-panel landing-preview-panel-motion">
                  <p className="landing-preview-label">Motion</p>
                  <h3 className="landing-preview-title">Recovery Walk</h3>
                  <p className="landing-preview-meta">30 min · intensity 4 · afternoon reset</p>
                  <div className="landing-preview-bar">
                    <div className="landing-preview-fill landing-preview-fill-motion" />
                  </div>
                </article>
              </div>
            </section>

            <div className="landing-feature-grid">
              <section className="callout planner-secondary-card landing-feature-card">
                <p className="callout-title">Reusable planning blocks</p>
                <p className="callout-body">
                  Turn proven routines into reusable blocks, then schedule them without rebuilding
                  your week from scratch.
                </p>
              </section>

              <section className="callout planner-secondary-card landing-feature-card">
                <p className="callout-title">Reflection that closes the loop</p>
                <p className="callout-body">
                  Mood, duration, and intensity tracking show whether your plan performed well in
                  real life, not just in theory.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
