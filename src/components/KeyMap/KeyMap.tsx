import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Toggle from "@radix-ui/react-toggle";
import { X } from "lucide-react";
import { useIsSynthDisabled } from "@/store/selectors";
import { UI } from "@/config/constants";
import styles from "./KeyMap.module.css";
import Button from "../Button";
import { cn } from "@/utils/cssUtils";
import Column from "../Column";
import { Keyboard } from "lucide-react";

function KeyMap() {
  const [isOpen, setIsOpen] = useState<boolean>(
    UI.DEFAULTS.KEYBOARD_INSTRUCTIONS_OPEN
  );
  const isDisabled = useIsSynthDisabled();

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Toggle.Root
          asChild
          aria-label="Show keyboard instructions"
          title="Show keyboard instructions"
        >
          <Button icon={<Keyboard />} segmented disabled={isDisabled}>
            Key Map
          </Button>
        </Toggle.Root>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            <Column align="flex-start">
              <Dialog.Title className={styles.title}>
                Keyboard Mapping
              </Dialog.Title>
              <Dialog.Description className={styles.dialogDescription}>
                {/* Use your computer keyboard to play the Minimoog */}
              </Dialog.Description>
            </Column>
            <Dialog.Close className={styles.closeButton}>
              <X />
            </Dialog.Close>
          </div>

          <div className={styles.body}>
            <div className={styles.legend}>
              <div className={styles.item}>
                <div className={cn(styles.color, styles.pitch)}></div>
                <div className={styles.description}>Pitch</div>
              </div>
              <div className={styles.item}>
                <div className={cn(styles.color, styles.mod)}></div>
                <div className={styles.description}>Modulation</div>
              </div>
              <div className={styles.item}>
                <div className={cn(styles.color, styles.black)}></div>
                <div className={styles.description}>C#2 - D#3</div>
              </div>
              <div className={styles.item}>
                <div className={cn(styles.color, styles.white)}></div>
                <div className={styles.description}>C2 - F3</div>
              </div>
              <div className={styles.item}>
                <div className={cn(styles.color, styles.octave)}></div>
                <div className={styles.description}>Octave</div>
              </div>
            </div>
            <section>
              <div className={styles.keyMapping}>
                <div className={styles.row}>
                  <div className={styles.label}>
                    <span className={cn(styles.note, styles.after)}>-</span>
                    <span className={cn(styles.note, styles.after)}>+</span>
                    <span className={cn(styles.note, styles.after)}>off</span>
                    <span className={cn(styles.note, styles.after)}>20%</span>
                    <span className={cn(styles.note, styles.after)}>40%</span>
                    <span className={cn(styles.note, styles.after)}>60%</span>
                    <span className={cn(styles.note, styles.after)}>80%</span>
                    <span className={cn(styles.note, styles.after)}>max</span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                  </div>
                  <div className={styles.keys}>
                    <kbd className={styles.pitch}>1</kbd>
                    <kbd className={styles.pitch}>2</kbd>
                    <kbd className={styles.mod}>3</kbd>
                    <kbd className={styles.mod}>4</kbd>
                    <kbd className={styles.mod}>5</kbd>
                    <kbd className={styles.mod}>6</kbd>
                    <kbd className={styles.mod}>7</kbd>
                    <kbd className={styles.mod}>8</kbd>
                    <kbd className={styles.disabled}>9</kbd>
                    <kbd className={styles.disabled}>0</kbd>
                    <kbd className={styles.disabled}>-</kbd>
                    <kbd className={styles.disabled}>+</kbd>
                    <kbd className={styles.disabled}>DEL</kbd>
                  </div>
                </div>

                <div className={styles.rowFlex}>
                  <div className={styles.keys}>
                    <kbd className={styles.disabled}>Q</kbd>
                    <kbd className={styles.black}>W</kbd>
                    <kbd className={styles.black}>E</kbd>
                    <kbd className={styles.disabled}>R</kbd>
                    <kbd className={styles.black}>T</kbd>
                    <kbd className={styles.black}>Y</kbd>
                    <kbd className={styles.black}>U</kbd>
                    <kbd className={styles.disabled}>I</kbd>
                    <kbd className={styles.black}>O</kbd>
                    <kbd className={styles.black}>P</kbd>
                    <kbd className={styles.disabled}>[</kbd>
                    <kbd className={styles.disabled}>]</kbd>
                  </div>

                  <div className={styles.rowFlex}>
                    <div className={styles.keys}>
                      <kbd className={styles.white}>A</kbd>
                      <kbd className={styles.white}>S</kbd>
                      <kbd className={styles.white}>D</kbd>
                      <kbd className={styles.white}>F</kbd>
                      <kbd className={styles.white}>G</kbd>
                      <kbd className={styles.white}>H</kbd>
                      <kbd className={styles.white}>J</kbd>
                      <kbd className={styles.white}>K</kbd>
                      <kbd className={styles.white}>L</kbd>
                      <kbd className={styles.white}>;</kbd>
                      <kbd className={styles.white}>'</kbd>
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.keys}>
                    <kbd className={styles.octave}>Z</kbd>
                    <kbd className={styles.octave}>X</kbd>
                    <kbd className={styles.disabled}>C</kbd>
                    <kbd className={styles.disabled}>V</kbd>
                    <kbd className={styles.disabled}>B</kbd>
                    <kbd className={styles.disabled}>N</kbd>
                    <kbd className={styles.disabled}>M</kbd>
                    <kbd className={styles.disabled}>,</kbd>
                    <kbd className={styles.disabled}>.</kbd>
                    <kbd className={styles.disabled}>/</kbd>
                  </div>
                  <div className={styles.label}>
                    <span className={cn(styles.note, styles.before)}>-</span>
                    <span className={cn(styles.note, styles.before)}>+</span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                    <span className={styles.note}></span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default KeyMap;
