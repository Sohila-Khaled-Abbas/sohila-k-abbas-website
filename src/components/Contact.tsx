import { Mail, Linkedin, Github, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const contacts = [
  { icon: Mail, label: "Email", href: "mailto:sohila.k.data@gmail.com", display: "sohila.k.data@gmail.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/sohilakabbas", display: "linkedin.com/in/sohilakabbas" },
  { icon: Github, label: "GitHub", href: "https://github.com/Sohila-Khaled-Abbas", display: "github.com/Sohila-Khaled-Abbas" },
];

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <span className="section-label">Professional contact</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3">Let’s discuss useful work.</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Verified business inquiries</CardTitle>
              <CardDescription>Remote roles, contract work, paid projects, and paid technical consultation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">Business registration, official domain, and work-email ownership must be reviewed before a private invitation is issued. The inquiry form is available only on the current portfolio.</p>
              <a className="inline-flex items-center gap-2 font-semibold underline underline-offset-4" href="https://sohila-khaled-abbas.vercel.app/services/#business-inquiry">Request business verification <ArrowUpRight className="h-4 w-4" /></a>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader><CardTitle>Professional channels</CardTitle><CardDescription>Communication is through email, LinkedIn, or GitHub.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              {contacts.map(({icon: Icon,label,href,display})=>(
                <a key={label} href={href} target={href.startsWith("https:")?"_blank":undefined} rel={href.startsWith("https:")?"noopener noreferrer":undefined} className="flex items-center gap-3 text-sm break-all">
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span><span className="sr-only">{label}: </span>{display}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
