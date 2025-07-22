import styles from "./Logo.module.css";

function Logo() {
  return (
    <div className={styles.logo}>
      <img src="/images/minimoog-logo.webp" alt="Minimoog Logo" />
    </div>
  );
}

export default Logo;
