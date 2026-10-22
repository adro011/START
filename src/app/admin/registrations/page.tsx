import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  deleteRegistration,
  isRegistrationOpen,
  listRegistrations,
  setRegistrationOpen,
} from "@/lib/registrations";

async function toggleRegistration(formData: FormData): Promise<void> {
  "use server";
  await requireAdmin("/admin/registrations");
  const enabled = String(formData.get("enabled")) === "true";
  await setRegistrationOpen(enabled);
  revalidatePath("/admin/registrations");
  revalidatePath("/");
}

async function removeRegistration(formData: FormData): Promise<void> {
  "use server";
  await requireAdmin("/admin/registrations");
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) await deleteRegistration(id);
  revalidatePath("/admin/registrations");
}

function joined(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function RegistrationsPage() {
  const [open, rows] = await Promise.all([isRegistrationOpen(), listRegistrations()]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Registrations</h1>
          <p className="text-sm text-ash">
            Emails captured by the footer “Join us” form. Stored in Supabase and
            notified to {process.env.REGISTRATION_NOTIFY_EMAIL ?? "the site email"}.
          </p>
        </div>
        <form action={toggleRegistration}>
          <input type="hidden" name="enabled" value={open ? "false" : "true"} />
          <button
            type="submit"
            className={`rounded px-4 py-2 text-sm font-semibold ${
              open
                ? "bg-gold text-black hover:bg-gold-dark"
                : "border border-white/20 text-steel hover:bg-white/10"
            }`}
          >
            {open ? "Registration open — close it" : "Registration closed — open it"}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            open ? "bg-gold/15 text-gold" : "bg-white/10 text-ash"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-gold" : "bg-ash"}`} />
          {open ? "Open" : "Closed"}
        </span>
        <span className="text-ash">{rows.length} registration{rows.length === 1 ? "" : "s"}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/15">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-[var(--color-charcoal)] text-xs uppercase tracking-wider text-ash">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-ash">
                  No registrations yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 font-mono text-xs">{row.email}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2 text-ash">{row.source}</td>
                  <td className="px-3 py-2 text-ash">{joined(row.created_at)}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={removeRegistration} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded border border-white/15 px-2.5 py-1 text-xs text-steel hover:border-red-400/60 hover:text-red-300"
                      >
                        Remove
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
        Deleting a row removes the address permanently. Closing registration
        hides the footer form and rejects new signups until reopened.
      </p>
    </div>
  );
}
