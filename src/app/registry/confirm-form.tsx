"use client";

import type { FormEvent, ReactNode } from "react";

/**
 * Form wrapper that asks for confirmation before running a server action.
 *
 * Must be a Client Component: event handlers cannot be attached inside a
 * Server Component — doing so throws during the server render ("Something
 * snagged." in production). The registry pages previously did exactly that.
 */
export default function ConfirmForm({
  action: run,
  message,
  className,
  children,
}: {
  /** Usually a server action. Its return value is ignored (Next.js <form
   *  action> only types void returns, but these actions return result objects
   *  so the caller can branch on them). */
  action: (formData: FormData) => unknown;
  message: string;
  className?: string;
  children: ReactNode;
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(message)) event.preventDefault();
  }

  // Awaited rather than fire-and-forget, so a thrown redirect()/error inside
  // the action still propagates through React's action handling.
  async function submit(formData: FormData): Promise<void> {
    await run(formData);
  }

  return (
    <form action={submit} onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}
