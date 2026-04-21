"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthForm } from "../../components/auth-form";
import { signup } from "../../lib/api";
import { setStoredToken } from "../../lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthForm
      title="Build a calmer weekly operating system."
      description="Create your account, define your planning defaults, and start balancing deep work with recovery."
      fields={[
        {
          name: "full_name",
          label: "Full name",
          autoComplete: "name",
          placeholder: "Your name",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          placeholder: "you@example.com",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
          placeholder: "At least 8 characters",
        },
        {
          name: "timezone",
          label: "Timezone",
          placeholder: "America/New_York",
        },
      ]}
      submitLabel="Create Account"
      error={error}
      message={message}
      messageTone="success"
      loading={loading}
      onSubmit={async (values) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
          const response = await signup({
            full_name: values.full_name,
            email: values.email,
            password: values.password,
            timezone: values.timezone || "America/New_York",
          });
          setStoredToken(response.token.access_token);
          setMessage("Account created successfully.");
          router.push("/onboarding");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to create account.");
        } finally {
          setLoading(false);
        }
      }}
      footer={
        <p>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      }
    />
  );
}
