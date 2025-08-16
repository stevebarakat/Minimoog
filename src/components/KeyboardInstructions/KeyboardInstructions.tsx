import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import styles from "./KeyboardInstructions.module.css";

export function KeyboardInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className={styles.instructionsButton}
          aria-label="Show keyboard instructions"
          title="Show keyboard instructions"
        >
          Instructions
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Virtual Keyboard Instructions
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className={styles.closeButton} aria-label="Close">
                ×
              </button>
            </Dialog.Close>
          </div>

          <div className={styles.body}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Musical Keys</h3>
              <div className={styles.keyMapping}>
                <div className={styles.keyRow}>
                  <span className={styles.keyLabel}>Top Row (Black Keys):</span>
                  <div className={styles.noteNames}>
                    <kbd>C#</kbd> <kbd>D#</kbd> <kbd>F#</kbd> <kbd>G#</kbd>{" "}
                    <kbd>A#</kbd> <kbd>C#</kbd> <kbd>D#</kbd> <kbd>F#</kbd>{" "}
                    <kbd>G#</kbd> <kbd>A#</kbd>
                  </div>
                  <div className={styles.keys}>
                    <kbd>W</kbd> <kbd>E</kbd> <kbd>T</kbd> <kbd>Y</kbd>{" "}
                    <kbd>U</kbd> <kbd>O</kbd> <kbd>P</kbd> <kbd>Q</kbd>{" "}
                    <kbd>R</kbd> <kbd>I</kbd>
                  </div>
                </div>

                <div className={styles.keyRow}>
                  <span className={styles.keyLabel}>
                    Bottom Row (White Keys):
                  </span>
                  <div className={styles.noteNames}>
                    <kbd>C</kbd> <kbd>D</kbd> <kbd>E</kbd> <kbd>F</kbd>{" "}
                    <kbd>G</kbd> <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd>{" "}
                    <kbd>D</kbd> <kbd>E</kbd> <kbd>F</kbd>
                  </div>
                  <div className={styles.keys}>
                    <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd>{" "}
                    <kbd>G</kbd> <kbd>H</kbd> <kbd>J</kbd> <kbd>K</kbd>{" "}
                    <kbd>L</kbd> <kbd>;</kbd> <kbd>'</kbd>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Octave Control</h3>
              <div className={styles.controlKeys}>
                <div className={styles.keyRow}>
                  <kbd>Z</kbd> <kbd>,</kbd> <kbd>&lt;</kbd>
                  <span className={styles.description}>Octave Down</span>
                </div>
                <div className={styles.keyRow}>
                  <kbd>.</kbd> <kbd>/</kbd> <kbd>&gt;</kbd>
                  <span className={styles.description}>Octave Up</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Pitch Bend</h3>
              <div className={styles.controlKeys}>
                <div className={styles.keyRow}>
                  <kbd>1</kbd>
                  <span className={styles.description}>
                    Pitch Bend Down (Hold)
                  </span>
                </div>
                <div className={styles.keyRow}>
                  <kbd>2</kbd>
                  <span className={styles.description}>
                    Pitch Bend Up (Hold)
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Modulation</h3>
              <div className={styles.controlKeys}>
                <div className={`${styles.keyRow} ${styles.modulationRow}`}>
                  <kbd>3</kbd>
                  <span className={styles.description}>0%</span>
                  <kbd>4</kbd>
                  <span className={styles.description}>20%</span>
                  <kbd>5</kbd>
                  <span className={styles.description}>40%</span>
                  <kbd>6</kbd>
                  <span className={styles.description}>60%</span>
                  <kbd>7</kbd>
                  <span className={styles.description}>80%</span>
                  <kbd>8</kbd>
                  <span className={styles.description}>100%</span>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={`${styles.sectionTitle} ${styles.tipsTitle}`}>
                Tips
              </h3>
              <ul className={styles.tips}>
                <li>
                  Click on the virtual keyboard keys with your mouse for visual
                  feedback
                </li>
                <li>Use your computer keyboard for faster playing</li>
                <li>Hold down keys for sustained notes</li>
                <li>
                  Combine pitch bend and modulation for expressive playing
                </li>
                <li>Use octave controls to access different note ranges</li>
              </ul>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default KeyboardInstructions;
