import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  deleteContactMessage,
  listContactMessages,
  setContactStatus,
  type ContactStatus,
} from "@/lib/contact";

const STATUSES: ContactStatus[] = ["new", "read", "replied", "archived"];

async function updateStatus(formData: FormData): Promise<void> {
  "use server";
  await requireAdmin("/admin/messages");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as ContactStatus;
  if (Number.isFinite(id) && STATUSES.includes(status)) {
    await setContactStatus(id, status);
  }
  revalidatePath("/admin/messages");
}

async function removeMessage(formData: FormData): Promise<void> {
  "use server";
  await requireAdmin("/admin/messages");
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) await deleteContactMessage(id);
  revalidatePath("/admin/messages");
}

function received(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function MessagesPage() {
  const rows = await listContactMessages();
  const unread = rows.filter((row) => row.status === "new").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-ash">
          Contact form submissions stored in Supabase and emailed to{" "}
          {process.env.CONTACT_NOTIFY_EMAIL ?? "the site email"}. Reply straight
          from your inbox — the customer is set as Reply-To.
        </p>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {unread} new
        </span>
        <span className="text-ash">
          {rows.length} message{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="bg-[var(--color-charcoal)] text-xs uppercase tracking-wider text-ash">
              <th className="px-3 py-2">From</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Received</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-ash">
                  No messages yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium">{row.name}</div>
                    <a
                      href={`mailto:${row.email}?subject=${encodeURIComponent("Re: your message to us")}`}
                      className="font-mono text-xs text-gold underline underline-offset-4"
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="max-w-md px-3 py-2 whitespace-pre-wrap break-words text-steel">
                    {row.message}
                  </td>
                  <td className="px-3 py-2">
                    <form action={updateStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={row.id} />
                      <select
                        name="status"
                        defaultValue={row.status}
                        className="rounded border border-white/15 bg-[#111111] px-2 py-1 text-xs text-[var(--color-smoke)]"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded border border-white/15 px-2 py-1 text-xs text-steel hover:border-gold/60 hover:text-gold"
                      >
                        Save
                      </button>
                    </form>
                    <p className="mt-1 text-[11px] text-ash">
                      {row.emailed_at ? "Email sent" : "Email not sent"}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-ash">{received(row.created_at)}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={removeMessage} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded border border-white/15 px-2.5 py-1 text-xs text-steel hover:border-red-400/60 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ash">
        Deleting a message removes it permanently. Emails are sent through
        Resend when <code>RESEND_API_KEY</code> is configured.
      </p>
    </div>
  );
}
