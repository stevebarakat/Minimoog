import styles from "./Ribbon.module.css";
import { cn } from "@/utils/ui";

type Props = {
  url: string;
  text: string;
};

function Ribbon({ url, text }: Props) {
  return (
    <a
      href={url}
      className={cn(styles.ribbon, styles.rightTop)}
      data-ribbon={text}
    >
      {text}
    </a>
  );
}

export default Ribbon;
