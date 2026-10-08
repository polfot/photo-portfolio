import Link from "next/link";
import styles from "./NotFound.module.css";

// Shared by the 404 page and by project links that point to a project that no longer exists.
export function NotFound({ message = "This page could not be found." }: { message?: string }) {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.message}>{message}</h1>
      <Link href="/">Back to home →</Link>
    </div>
  );
}
