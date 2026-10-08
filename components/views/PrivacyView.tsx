"use client";

import { getSiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import { useData } from "@/lib/useData";
import styles from "./PrivacyView.module.css";

const LAST_UPDATED = "8 October 2026";

// The contact email is read live from the dashboard settings, so it always matches the About page.
// Until it arrives the page waits, so the built-in default never flashes before the real address.
export function PrivacyView() {
  const settings = useData("settings", getSiteSettings);
  if (settings.status === "loading") return null;
  const email = settings.status === "ready" ? settings.data.email : site.email;
  const mail = <a href={`mailto:${email}`}>{email}</a>;

  return (
    <main className={`${styles.main} appear`}>
      <header className={styles.heading}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>
      </header>

      <div className={styles.body}>
        <section>
          <h2>Copyright</h2>
          <p>
            All photographs, texts, the logo and the design of this website are the property of {site.name} and are
            protected by Greek, EU and international copyright law. All rights are reserved.
          </p>
        </section>

        <section>
          <h2>What is not allowed</h2>
          <p>
            Without our prior written permission, no content from this website may be copied, downloaded, reproduced,
            republished, shared on social media, edited, cropped, printed or used for any personal or commercial
            purpose. This includes removing or covering any credit and using the photographs to train AI models.
          </p>
        </section>

        <section>
          <h2>Sharing</h2>
          <p>
            You are welcome to share a link to this website or to one of its pages. Sharing a link is not the same as
            sharing the photographs themselves.
          </p>
        </section>

        <section>
          <h2>Permissions</h2>
          <p>
            Anyone who would like to use a photograph should ask first at {mail}. Any
            permission we give is limited to the use we agree on in writing and always requires credit to {site.name}.
          </p>
        </section>

        <section>
          <h2>People in our photographs</h2>
          <p>
            Every person who can be recognised in the photographs on this website has given their consent for the
            images to be published here. If you appear in a photograph and would like it removed, email us at {mail}
            and we will remove it promptly.
          </p>
        </section>

        <section>
          <h2>Your privacy</h2>
          <p>
            This website does not use tracking cookies, analytics or forms and does not collect personal data from its
            visitors.
          </p>
        </section>

        <section>
          <h2>Misuse</h2>
          <p>
            Any unauthorised use of our content is a breach of copyright. We reserve the right to request its removal
            and to take legal action.
          </p>
        </section>
      </div>
    </main>
  );
}
