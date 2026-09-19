import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="welcome-page">
      <section className="welcome-introduction">
        <div className="welcome-brand">
          <span className="brand-mark">T</span>
          <span>ThriveTrack</span>
        </div>

        <div className="welcome-copy">
          <span className="welcome-eyebrow">
            Workload and wellbeing
          </span>

          <h1>
            Understand your workload.
            <br />
            Support your wellbeing.
          </h1>

          <p>
            ThriveTrack is a self-check platform that helps you monitor
            workload, self-reported wellbeing, and recognise patterns over time.
          </p>

          <div className="welcome-features">
            <div className="welcome-feature">
              <span className="feature-number">01</span>
              <div>
                <strong>Understand your workload</strong>
                <p>Track tasks, duration, and perceived workload.</p>
              </div>
            </div>

            <div className="welcome-feature">
              <span className="feature-number">02</span>
              <div>
                <strong>Reflect on wellbeing</strong>
                <p>Complete short check-ins and notice changes over time.</p>
              </div>
            </div>

            <div className="welcome-feature">
              <span className="feature-number">03</span>
              <div>
                <strong>See your progress</strong>
                <p>Review trends and changes through your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="welcome-action-panel">
        {children}
      </section>
    </main>
  );
}

export default AuthLayout;