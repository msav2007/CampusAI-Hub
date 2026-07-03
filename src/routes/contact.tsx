import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...buildPageHead({
      title: "Contact — CampusAI Tools",
      description:
        "Questions, feedback, bug reports, or partnership ideas? Get in touch with the CampusAI Tools team.",
      path: "/contact",
    }),
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const subject = encodeURIComponent(`CampusAI feedback from ${name.slice(0, 80)}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:hello@campusai.tools?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pb-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Contact</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Say <span className="text-gradient">hello</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Feedback, feature requests, bug reports, or partnership ideas. We read everything.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <InfoCard
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value="hello@campusai.tools"
              hint="We usually reply within two business days."
            />
            <InfoCard
              icon={<MessageCircle className="h-4 w-4" />}
              label="What to send"
              value="Feature ideas, bugs, partnerships"
              hint="Tell us what workflow is costing you time."
            />
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-2xl glass p-5 shadow-card lg:col-span-3"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-muted-foreground">
                  Your name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs text-muted-foreground">
                Message
              </Label>
              <Textarea
                id="message"
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={2000}
                required
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Sending opens your default email app with this message prefilled.
              </p>
              <Button type="submit">
                {sent ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Opening email...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function InfoCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl glass p-5 shadow-card">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[11px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 text-base font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
