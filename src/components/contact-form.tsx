"use client";

import { useState, type FormEvent } from "react";

export interface ContactFormCopy {
  labels: {
    name: string;
    email: string;
    message: string;
  };
  placeholders: {
    name: string;
    email: string;
    message: string;
  };
  submit: string;
  sending: string;
  success: string;
  error: string;
  networkError: string;
}

export default function ContactForm({
  copy,
  initialStatus = null,
}: {
  copy: ContactFormCopy;
  initialStatus?: "sent" | "error" | null;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    text: string;
    ok: boolean;
  } | null>(
    initialStatus === "sent"
      ? { text: copy.success, ok: true }
      : initialStatus === "error"
        ? { text: copy.error, ok: false }
        : null,
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company") ?? "") !== "") return;

    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (res.ok && json?.ok) {
        form.reset();
        setStatus({ text: copy.success, ok: true });
      } else {
        setStatus({ text: json?.error || copy.error, ok: false });
      }
    } catch {
      setStatus({ text: copy.networkError, ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      method="POST"
      action="/api/contact"
      onSubmit={onSubmit}
      data-contact-form
      className="space-y-5 border border-white/15 bg-[var(--color-dark-iron)] p-6 sm:p-8"
    >
      <div className="textInputWrapper">
        <label htmlFor="name" className="text-sm font-semibold uppercase tracking-[0.12em]">
          {copy.labels.name}
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder={copy.placeholders.name}
          className="textInput w-full bg-[var(--color-dark-iron)] border-0 py-3 placeholder:text-ash outline-none"
        />
      </div>
      <div className="textInputWrapper">
        <label htmlFor="email" className="text-sm font-semibold uppercase tracking-[0.12em]">
          {copy.labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          placeholder={copy.placeholders.email}
          className="textInput w-full bg-[var(--color-dark-iron)] border-0 py-3 placeholder:text-ash outline-none"
        />
      </div>
      <div className="textInputWrapper">
        <label htmlFor="message" className="text-sm font-semibold uppercase tracking-[0.12em]">
          {copy.labels.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder={copy.placeholders.message}
          className="textInput w-full bg-[var(--color-dark-iron)] border-0 resize-y py-3 placeholder:text-ash outline-none"
        />
      </div>
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <p
        data-form-status
        role="status"
        aria-live="polite"
        className={`text-sm font-medium ${status ? "" : "hidden"}`}
        style={status ? { color: status.ok ? "#2f6b3a" : "var(--color-clay)" } : undefined}
      >
        {status?.text}
      </p>
      <button
        type="submit"
        disabled={loading}
        data-form-submit
        className="w-full bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {loading ? copy.sending : `${copy.submit} →`}
      </button>
    </form>
  );
}
