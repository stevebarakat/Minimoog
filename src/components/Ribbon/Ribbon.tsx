import styles from "./Ribbon.module.css";

type Props = {
  url: string;
  text: string;
};

function Ribbon({ url, text }: Props) {
  return (
    <a
      href={url}
      className={`${styles.ribbon} ${styles.rightTop} ${styles.fixed}`}
      data-ribbon={text}
    >
      {text}
    </a>
  );
}

export default Ribbon;
