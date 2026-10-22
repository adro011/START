import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { page, rec, text } from "@/lib/content";

export const metadata: Metadata = {
  title: `Contact | ${SITE.name}`,
  description: `Contact ${SITE.name} — sizing help, orders and delivery across Bangladesh. Replies within 1–2 working days.`,
};

export default function ContactPage() {
  const p = page("contact");
  const form = rec(p.form);
  const formName = rec(form.name);
  const formEmail = rec(form.email);
  const formMessage = rec(form.message);
  const aside = rec(p.aside);
  const asideTrack = rec(aside.track);

  return (
    <main className="bg-black text-[var(--color-smoke)]">
      <section className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{text(p.eyebrow)}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
          {text(p.title)}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-steel">
          {text(p.intro)}
        </p>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
          <form
            method="POST"
            action="/api/contact"
            data-contact-form
            className="space-y-5 border border-white/15 bg-[var(--color-dark-iron)] p-6 sm:p-8"
          >
            <div className="textInputWrapper">
              <label htmlFor="name" className="text-sm font-semibold uppercase tracking-[0.12em]">{text(formName.label)}</label>
              <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder={text(formName.placeholder)}
                className="textInput w-full bg-[var(--color-dark-iron)] border-0 py-3 placeholder:text-ash outline-none" />
            </div>
            <div className="textInputWrapper">
              <label htmlFor="email" className="text-sm font-semibold uppercase tracking-[0.12em]">{text(formEmail.label)}</label>
              <input id="email" name="email" type="email" required maxLength={160} autoComplete="email" placeholder={text(formEmail.placeholder)}
                className="textInput w-full bg-[var(--color-dark-iron)] border-0 py-3 placeholder:text-ash outline-none" />
            </div>
            <div className="textInputWrapper">
              <label htmlFor="message" className="text-sm font-semibold uppercase tracking-[0.12em]">{text(formMessage.label)}</label>
              <textarea id="message" name="message" required minLength={10} maxLength={2000} rows={5}
                placeholder={text(formMessage.placeholder)}
                className="textInput w-full bg-[var(--color-dark-iron)] border-0 resize-y py-3 placeholder:text-ash outline-none" />
            </div>
            {/* honeypot */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <p data-form-status role="status" aria-live="polite" className="hidden text-sm font-medium" />
            <button type="submit" data-form-submit
              className="w-full bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-black hover:bg-gold-dark disabled:opacity-60 sm:w-auto sm:px-10">
              {text(form.submit)} →
            </button>
            <script dangerouslySetInnerHTML={{ __html: `(function(){var f=document.querySelector('[data-contact-form]');if(!f)return;var s=f.querySelector('[data-form-status]');var b=f.querySelector('[data-form-submit]');function show(m,ok){if(!s)return;s.textContent=m;s.classList.remove('hidden');s.style.color=ok?'#2f6b3a':'var(--color-clay)';}f.addEventListener('submit',function(e){if(!window.fetch)return;e.preventDefault();var fd=new FormData(f);if(fd.get('company'))return;var payload={name:String(fd.get('name')||''),email:String(fd.get('email')||''),message:String(fd.get('message')||'')};if(b){b.disabled=true;b.textContent=${JSON.stringify(text(form.sending))};}fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j};});}).then(function(r){if(r.ok&&r.j.ok){f.reset();show(${JSON.stringify(text(form.success))},true);}else{show((r.j&&r.j.error)||${JSON.stringify(text(form.error))},false);} }).catch(function(){show(${JSON.stringify(text(form.networkError))},false);}).finally(function(){if(b){b.disabled=false;b.textContent=${JSON.stringify(text(form.submit))} + ' →';}});});})();` }} />
          </form>
          <aside className="space-y-4">
            <div className="bg-[var(--color-dark-iron)] p-6 text-[var(--color-smoke)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gold">{text(aside.direct)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{text(aside.email)}</p>
              <a href={`mailto:${SITE.email}`} className="font-medium text-gold underline underline-offset-4">{SITE.email}</a>
              <p className="mt-4 text-sm leading-relaxed text-steel">{text(aside.phone)}</p>
              <a href={`tel:${SITE.phone}`} className="font-medium text-gold underline underline-offset-4">{SITE.phone}</a>
              <p className="mt-4 text-sm text-steel">{text(aside.note)}</p>
            </div>
            <div className="border border-white/15 bg-[var(--color-dark-iron)] p-6 text-sm leading-relaxed text-steel">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-smoke)]">{text(asideTrack.title)}</h2>
              <p className="mt-2">{text(asideTrack.body)} <Link href="/track" className="text-gold underline underline-offset-4">tracking page</Link></p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
