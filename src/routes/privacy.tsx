import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    ...buildPageHead({
      title: "Privacy Policy — CampusAI Tools",
      description:
        "How CampusAI Tools handles data. Live tools run in your browser and we do not sell your data.",
      path: "/privacy",
    }),
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="July 2026">
      <p>
        This page explains, in plain language, what data CampusAI Tools collects and how we use it.
        It applies to the public CampusAI Tools website and its subdomains.
      </p>

      <h2>Tools run in your browser</h2>
      <p>
        Our calculators, resume ATS checker, and JSON formatter run on your device. Inputs you type
        or upload are not sent to our servers. When a tool remembers your latest state, it does so
        with browser local storage only.
      </p>

      <h2>Information we may collect</h2>
      <ul>
        <li>
          <strong>Usage analytics:</strong> aggregated, anonymous product usage to improve the site.
        </li>
        <li>
          <strong>Email requests:</strong> if you contact us or request launch updates by email.
        </li>
        <li>
          <strong>Contact messages:</strong> the email address and message you choose to send us.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not sell, rent, or trade personal data.</li>
        <li>We do not build advertising profiles of individual users.</li>
        <li>We do not require an account to use the live free tools.</li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>
        We use a small number of first-party browser storage keys for essential experiences such as
        your latest calculator state. If we add analytics or advertising cookies in the future, we
        will update this page and ask for consent where required.
      </p>

      <h2>Third-party services</h2>
      <p>
        We may use privacy-respecting hosting, analytics, or infrastructure providers to run the
        site. We share only what those providers need to operate the service, never the resume,
        calculator, or JSON content you use in the live tools.
      </p>

      <h2>Your rights</h2>
      <p>
        You can clear your browser storage at any time to remove locally saved data. To request
        deletion of contact or email-request records, reach out through the Contact page.
      </p>

      <h2>Changes</h2>
      <p>
        We will update this page when our practices change and refresh the Last updated date at the
        top.
      </p>
    </LegalPage>
  );
}
