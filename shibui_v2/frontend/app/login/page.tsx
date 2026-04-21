"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthForm } from "../../components/auth-form";
import { login } from "../../lib/api";
import { setStoredToken } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthForm
      title="Return to your planning rhythm."
      description="Log in to manage focused work, movement, and reflection from one workspace."
      fields={[
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
          autoComplete: "current-password",
          placeholder: "Enter your password",
        },
      ]}
      submitLabel="Log In"
      error={error}
      message={message}
      messageTone="info"
      loading={loading}
      onSubmit={async (values) => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
          const response = await login({
            email: values.email,
            password: values.password,
          });
          setStoredToken(response.token.access_token);
          setMessage("Signed in successfully.");
          router.push("/app");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to log in.");
        } finally {
          setLoading(false);
        }
      }}
      footer={
        <p>
          New here? <Link href="/signup">Create an account</Link>
        </p>
      }
    />
  );
}
