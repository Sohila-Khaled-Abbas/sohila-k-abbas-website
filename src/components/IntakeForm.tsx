import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function IntakeForm() {
  return (
    <section className="container mx-auto max-w-3xl px-4 py-20">
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        <ShieldCheck className="h-10 w-10" aria-hidden="true" />
        <h1 className="text-3xl font-bold">Verified business inquiries</h1>
        <p className="text-muted-foreground leading-relaxed">The current inquiry form is reserved for approved businesses discussing remote professional work. Business registration, the official domain, and work-email ownership are reviewed before access is granted.</p>
        <p className="text-muted-foreground leading-relaxed" lang="ar" dir="rtl">نموذج الاستفسارات متاح للشركات المعتمدة فقط بخصوص فرص العمل والمشروعات المهنية عن بُعد. تتم مراجعة بيانات الشركة وبريد العمل قبل إرسال دعوة خاصة.</p>
        <a className="inline-flex items-center gap-2 font-semibold underline underline-offset-4" href="https://sohila-khaled-abbas.vercel.app/services/#business-inquiry">Open the current business inquiry page <ArrowUpRight className="h-4 w-4" /></a>
        <p className="text-sm text-muted-foreground">Communication is through <a className="underline" href="mailto:sohila.k.data@gmail.com">email</a>, <a className="underline" href="https://linkedin.com/in/sohilakabbas" target="_blank" rel="noopener noreferrer">LinkedIn</a>, or <a className="underline" href="https://github.com/Sohila-Khaled-Abbas" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
      </div>
    </section>
  );
}
