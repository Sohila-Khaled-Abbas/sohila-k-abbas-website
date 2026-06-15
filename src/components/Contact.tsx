import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Linkedin, Github, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// ─── Validation schema ────────────────────────────────────────

const contactSchema = z.object({
  name:    z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email:   z.string().trim().email("Invalid email address").max(255, "Email too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ─── Types ────────────────────────────────────────────────────

interface ContactDetail {
  icon:    typeof Mail;
  label:   string;
  href?:   string;
  display: string;
}

// ─── Data ─────────────────────────────────────────────────────

const CONTACT_DETAILS: ContactDetail[] = [
  {
    icon:    Mail,
    label:   "Email",
    href:    "mailto:sohila.k.data@gmail.com",
    display: "sohila.k.data@gmail.com",
  },
  {
    icon:    Phone,
    label:   "Phone",
    href:    "tel:+201114919021",
    display: "(+2) 01114919021",
  },
  {
    icon:    MapPin,
    label:   "Location",
    display: "Damietta, Egypt (Open to Remote & Hybrid Roles)",
  },
  {
    icon:    Linkedin,
    label:   "LinkedIn",
    href:    "https://linkedin.com/in/sohilakabbas",
    display: "linkedin.com/in/sohilakabbas",
  },
  {
    icon:    Github,
    label:   "GitHub",
    href:    "https://github.com/Sohila-Khaled-Abbas",
    display: "github.com/Sohila-Khaled-Abbas",
  },
];

// ─── Helpers ──────────────────────────────────────────────────

async function submitContactForm(data: ContactFormData): Promise<void> {
  const { error } = await supabase.from("contact_submissions").insert([{
    full_name:    data.name,
    email:        data.email,
    message:      data.message,
    submitted_at: new Date().toISOString(),
  }]);
  if (error) throw error;
}

// ─── Component ────────────────────────────────────────────────

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const parsed   = contactSchema.safeParse({
      name:    formData.get("name"),
      email:   formData.get("email"),
      message: formData.get("message"),
    });

    if (!parsed.success) {
      toast({ variant: "destructive", title: "Invalid input", description: parsed.error.issues[0].message });
      setIsSubmitting(false);
      return;
    }

    try {
      await submitContactForm(parsed.data);
      toast({ title: "Message sent!", description: "Thank you for reaching out. I'll get back to you soon." });
      e.currentTarget.reset();
    } catch {
      toast({ variant: "destructive", title: "Error sending message", description: "Please try again or email me directly." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">

        {/* ── Heading ── */}
        <div className="text-center mb-12">
          <span className="section-label">Contact</span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mt-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="gradient-text">Get In Touch</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* ── Message form ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card border-border gradient-border">
              <CardHeader>
                <CardTitle className="text-foreground">Send Me a Message</CardTitle>
                <CardDescription className="text-muted-foreground">
                  I'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      required
                      id="contact-name"
                      name="name"
                      placeholder="Your full name"
                      className="bg-background border-border focus:border-[hsl(var(--accent))] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      required
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-background border-border focus:border-[hsl(var(--accent))] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      required
                      id="contact-message"
                      name="message"
                      placeholder="Your message"
                      rows={5}
                      className="bg-background border-border focus:border-[hsl(var(--accent))] transition-colors resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-cta font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending…"
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Contact info card ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card border-border h-full gradient-border">
              <CardHeader>
                <CardTitle className="text-foreground">Contact Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Let's connect! I'm open to opportunities.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {CONTACT_DETAILS.map(({ icon: Icon, label, href, display }) => (
                  <div key={label} className="flex items-center gap-3">
                    {/* Icon badge */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsl(var(--accent) / 0.10)" }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "hsl(var(--accent))" }} />
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noreferrer" : undefined}
                        className="text-sm text-foreground hover:text-[hsl(var(--accent))] transition-colors"
                      >
                        {display}
                      </a>
                    ) : (
                      <span className="text-sm text-foreground">{display}</span>
                    )}
                  </div>
                ))}

                <p className="text-sm text-muted-foreground pt-4 border-t border-border leading-relaxed">
                  Looking forward to collaborating on data-driven projects or discussing how
                  I can help your organisation leverage data for better decision making.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
