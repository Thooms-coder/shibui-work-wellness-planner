"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

import { FlashBanner } from "./flash-banner";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
};

type AuthFormProps = {
  title: string;
  description: string;
  fields: Field[];
  submitLabel: string;
  error: string | null;
  message?: string | null;
  messageTone?: "info" | "success" | "danger";
  loading: boolean;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  footer: ReactNode;
};

export function AuthForm(props: AuthFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(props.fields.map((field) => [field.name, ""])),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await props.onSubmit(values);
  }

  return (
    <main className="login-screen">
      {props.message ? (
        <FlashBanner message={props.message} onClose={undefined} tone={props.messageTone ?? "info"} />
      ) : null}
      <section className="login-box">
        <div className="panel-copy">
          <p className="eyebrow">Shibui Planner</p>
          <h1 className="panel-title">{props.title}</h1>
          <p className="panel-description">{props.description}</p>
        </div>

        <form className="form-stack auth-form-stack" onSubmit={handleSubmit}>
          {props.fields.map((field) => (
            <label className="field auth-field" key={field.name}>
              <span className="auth-label">{field.label}</span>
              <input
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={values[field.name] ?? ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
              />
            </label>
          ))}

          {props.error ? <p className="form-error auth-error">{props.error}</p> : null}

          <div className="auth-form-actions">
            <span className="disabled-hint">Secure account access for your planning workspace</span>
          </div>

          <button className="primary-button auth-submit" disabled={props.loading} type="submit">
            {props.loading ? "Working..." : props.submitLabel}
          </button>
        </form>

        <div className="form-footer">{props.footer}</div>
      </section>
    </main>
  );
}
