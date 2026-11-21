import { ExternalLink } from "lucide-react";
import Row from "../Row";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.rows}>
        <Row justify="center" gap="var(--spacing-md)">
          <span>&copy; {new Date().getFullYear()} Steve Barakat</span>
          <span className={styles.githubLink}>
            <a
              href="https://github.com/stevebarakat/minimoog"
              target="_blank"
              rel="noopener noreferrer"
            >
              View project on GitHub
            </a>
          </span>
        </Row>
        <Row justify="center">
          <span>
            Built with guidance from{" "}
            <a
              href="https://www.joshwcomeau.com/blog/whimsical-animations/#the-synth-6"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <span className={styles.linkContent}>
                Josh Comeau&apos;s Whimsical Animations article
                <ExternalLink size={12} aria-hidden />
              </span>
            </a>
          </span>
        </Row>
      </div>
    </div>
  );
}

export default Footer;
