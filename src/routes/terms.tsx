import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/LegalPage";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    ...buildPageHead({
      title: "Terms of Service — CampusAI Tools",
      description: "The terms that govern your use of CampusAI Tools.",
      path: "/terms",
    }),
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="July 2026">
      <p>
        By using CampusAI Tools you agree to these terms. If you do not agree, please do not use the
        site.
      </p>

      <h2>Use of the service</h2>
      <p>
        Our public tools are provided for personal, educational, and general productivity use. You
        may use them as often as you like. Please do not scrape the site, attempt to disrupt it, or
        use it to break the law.
      </p>

      <h2>Accuracy of calculations and guidance</h2>
      <p>
        We take accuracy seriously, but these tools are guidance rather than official records or
        professional advice. Always confirm academic numbers with your institution and hiring
        decisions with your own judgment.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The CampusAI Tools name, branding, and site content belong to us. You keep ownership of any
        content you paste into a tool, and because the live tools run locally, we do not receive
        that content.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided as is without warranties of any kind. To the maximum extent
        permitted by law, we are not liable for indirect or consequential damages arising from your
        use of the site.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms as the product evolves. Continued use of the site after an update
        means you accept the revised terms.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms? Reach out through the Contact page.</p>
    </LegalPage>
  );
}
