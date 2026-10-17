import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact | ${SITE.name}`,
  description: `Contact ${SITE.name} — sizing help, orders and delivery across Bangladesh. Replies within 1–2 working days.`,
};

export default function ContactPage() {
  return (
    <main className="bg-black text-[#F5F5F5]">
      <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Contact</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          Ask us anything — we reply fast.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-steel">
          Sizing between two sizes? Wedding next week? Tell us your district
          and we&apos;ll suggest the fastest delivery option. We reply within
          1–2 working days (Sat–Thu).
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <form
            method="POST"
            action="/api/contact"
            data-contact-form
            className="space-y-5 border border-white/15 bg-[#181818] p-6 sm:p-8"
          >
            <div>
              <label htmlFor="name" className="text-sm font-semibold uppercase tracking-[0.12em]">Name</label>
              <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your full name"
                className="mt-2 w-full border border-white/15 bg-[#181818] px-4 py-3 outline-none placeholder:text-ash focus:border-gold" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-semibold uppercase tracking-[0.12em]">Email</label>
              <input id="email" name="email" type="email" required maxLength={160} autoComplete="email" placeholder="you@example.com"
                className="mt-2 w-full border border-white/15 bg-[#181818] px-4 py-3 outline-none placeholder:text-ash focus:border-gold" />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-semibold uppercase tracking-[0.12em]">Message</label>
              <textarea id="message" name="message" required minLength={10} maxLength={2000} rows={5}
                placeholder="Order no. (if any), size, district — e.g. Panjabi size 42 to Uttara, needed before Eid…"
                className="mt-2 w-full resize-y border border-white/15 bg-[#181818] px-4 py-3 outline-none placeholder:text-ash focus:border-gold" />
            </div>
            {/* honeypot */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <p data-form-status role="status" aria-live="polite" className="hidden text-sm font-medium" />
            <button type="submit" data-form-submit
              className="w-full bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark disabled:opacity-60 sm:w-auto sm:px-10">
              Send message →
            </button>
            <script dangerouslySetInnerHTML={{ __html: `(function(){var f=document.querySelector('[data-contact-form]');if(!f)return;var s=f.querySelector('[data-form-status]');var b=f.querySelector('[data-form-submit]');function show(m,ok){if(!s)return;s.textContent=m;s.classList.remove('hidden');s.style.color=ok?'#2f6b3a':'#A93A24';}f.addEventListener('submit',function(e){if(!window.fetch)return;e.preventDefault();var fd=new FormData(f);if(fd.get('company'))return;var payload={name:String(fd.get('name')||''),email:String(fd.get('email')||''),message:String(fd.get('message')||'')};if(b){b.disabled=true;b.textContent='Sending…';}fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});}).then(function(r){if(r.ok&&r.j.ok){f.reset();show('Thank you — message received. We reply within 1–2 working days.',true);}else{show((r.j&&r.j.error)||'Something went wrong. Please email us directly.',false);} }).catch(function(){show('Network error. Please email us directly.',false);}).finally(function(){if(b){b.disabled=false;b.textContent='Send message →';}});});})();` }} />
          </form>
          <aside className="space-y-4">
            <div className="bg-[#181818] p-6 text-[#F5F5F5]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">Direct</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">Email</p>
              <a href={`mailto:${SITE.email}`} className="font-medium text-gold underline underline-offset-4">{SITE.email}</a>
              <p className="mt-4 text-sm leading-relaxed text-steel">Phone / WhatsApp</p>
              <a href={`tel:${SITE.phone}`} className="font-medium text-gold underline underline-offset-4">{SITE.phone}</a>
              <p className="mt-4 text-sm text-steel">Sat–Thu, 10am–7pm (Dhaka time). For orders, keep your order number handy (e.g. BR-100231).</p>
            </div>
            <div className="border border-white/15 bg-[#181818] p-6 text-sm leading-relaxed text-steel">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F5F5]">Track an order</h2>
              <p className="mt-2">Use your order number + phone on our <Link href="/track" className="text-gold underline underline-offset-4">tracking page</Link>.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
