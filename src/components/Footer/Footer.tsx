import Row from "../Row";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <div className={styles.footer}>
      <Row justify="center" gap="var(--spacing-md)">
        <span>&copy; {new Date().getFullYear()} Steve Barakat</span>
        <span className={styles.link}>
          <a
            href="https://github.com/stevebarakat/minimoog"
            target="_blank"
            rel="noopener noreferrer"
          >
            View project on GitHub
          </a>
        </span>
      </Row>
    </div>
  );
}

export default Footer;
