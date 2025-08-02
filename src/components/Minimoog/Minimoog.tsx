import React, { lazy, Suspense, useRef, useState, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { useKeyboardState } from "@/store/selectors";
import styles from "./Minimoog.module.css";
import Container from "../Container";
import Side from "../Side";
import { BackPanel, MidPanel, FrontPanel } from "../Panels";
import Controllers from "../Controllers";
import OscillatorBank from "../OscillatorBank";
import Mixer from "../Mixer";
import Modifiers from "../Modifiers";
import Output from "../Output";
import Section from "../Section";
import PowerButton from "../PowerButton";
import Hinge from "../Hinge";
import SidePanel from "../SidePanel";
import Keyboard from "@/components/Keyboard";
import { useAudio, useFilterTracking, useURLSync } from "./hooks";
import { useUIState } from "./hooks/useUIState";
import { useAudioContextManagement } from "./hooks/useAudioContextManagement";
import Title from "../Title";
import { cn } from "@/utils";
import Row from "../Row";

// Lazy load non-critical components
const LazyPresetsDropdown = lazy(() => import("../PresetsDropdown"));
const LazyCopySettings = lazy(() => import("../CopySettings"));

const Minimoog = React.memo(function Minimoog() {
  const { activeKeys } = useKeyboardState();
  const { setActiveKeys } = useSynthStore();

  // UI state management
  // ----------------------------
  const { isMobile, view } = useUIState();

  // Audio context management
  // ----------------------------
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContextManagement();

  // URL synchronization
  // ----------------------------
  useURLSync();

  // Audio processing
  // ----------------------------
  const { mixerNode, filterNode, synthObj } = useAudio(audioContext);

  // Filter tracking
  // ----------------------------
  useFilterTracking(audioContext, filterNode, activeKeys);

  // Scroll arrow functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const shouldShowLeft = scrollLeft > 0;
    const shouldShowRight = scrollLeft < scrollWidth - clientWidth - 1;

    setShowLeftArrow(shouldShowLeft);
    setShowRightArrow(shouldShowRight);
  };

  const handleMouseMove = () => {
    setShowArrows(true);

    // Clear existing timeout
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current);
    }

    // Hide arrows after 2 seconds of no mouse movement
    mouseTimeoutRef.current = setTimeout(() => {
      setShowArrows(false);
    }, 2000);
  };

  const handleMouseLeave = () => {
    setShowArrows(false);
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleLeftArrowBlur = () => {
    if (showRightArrow) {
      // Focus the right arrow when left arrow loses focus
      const rightArrow = document.querySelector(
        `.${styles.scrollArrowRight}`
      ) as HTMLButtonElement;
      if (rightArrow) {
        rightArrow.focus();
      }
    }
  };

  const handleRightArrowBlur = () => {
    if (showLeftArrow) {
      // Focus the left arrow when right arrow loses focus
      const leftArrow = document.querySelector(
        `.${styles.scrollArrowLeft}`
      ) as HTMLButtonElement;
      if (leftArrow) {
        leftArrow.focus();
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!scrollRef.current) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        scrollLeft();
        break;
      case "ArrowRight":
        event.preventDefault();
        scrollRight();
        break;
      case "Home":
        event.preventDefault();
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        break;
      case "End":
        event.preventDefault();
        scrollRef.current.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: "smooth",
        });
        break;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkScrollPosition, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    checkScrollPosition();
  }, []);

  // Add mouse movement listeners
  useEffect(() => {
    const container = scrollRef.current?.parentElement;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  // Scroll to the right end on initial load to show the PowerButton
  useEffect(() => {
    if (scrollRef.current) {
      // Wait a bit for the content to render, then scroll to the end
      const timer = setTimeout(() => {
        if (scrollRef.current && scrollRef.current.scrollTo) {
          scrollRef.current.scrollTo({
            left: scrollRef.current.scrollWidth,
            behavior: "smooth",
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <Suspense fallback={<div>Loading controls...</div>}>
        <Row justify="center" gap="var(--spacing-md)">
          <LazyPresetsDropdown disabled={!isInitialized} />
          <LazyCopySettings disabled={!isInitialized} />
        </Row>
      </Suspense>
      <Container>
        <Side />
        <div className={styles.synth}>
          <BackPanel />
          <div className={styles.controlsContainer}>
            {showLeftArrow && (
              <button
                className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${
                  !showArrows ? styles.scrollArrowHidden : ""
                }`}
                onClick={scrollLeft}
                aria-label="Scroll controls left"
                aria-describedby="scroll-instructions"
                title="Scroll controls left"
                onBlur={handleLeftArrowBlur}
              >
                ‹
              </button>
            )}
            <div
              ref={scrollRef}
              className={styles.controlsPanel}
              data-onboarding="controls-panel"
              onScroll={checkScrollPosition}
              onKeyDown={handleKeyDown}
              role="region"
              aria-label="Synthesizer controls"
              tabIndex={0}
            >
              <Controllers />
              {isMobile && (
                <Section
                  style={{
                    paddingTop: "3.15rem",
                  }}
                >
                  <SidePanel />
                  <Title>Modulation</Title>
                </Section>
              )}
              <OscillatorBank />
              <Mixer audioContext={audioContext!} mixerNode={mixerNode!} />
              <Modifiers />
              <Output />
              <Section
                justify="center"
                style={{
                  borderRadius: "0 0 10px 0",
                  marginRight: "var(--spacing-md)",
                }}
              >
                <PowerButton
                  isOn={isInitialized}
                  onPowerOn={initialize}
                  onPowerOff={dispose}
                />
              </Section>
            </div>
            {showRightArrow && (
              <button
                className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${
                  !showArrows ? styles.scrollArrowHidden : ""
                }`}
                onClick={scrollRight}
                aria-label="Scroll controls right"
                aria-describedby="scroll-instructions"
                title="Scroll controls right"
                onBlur={handleRightArrowBlur}
              >
                ›
              </button>
            )}
            {/* Screen reader instructions */}
            <div id="scroll-instructions" className="sr-only">
              Use the arrow buttons to scroll through synthesizer controls when
              they extend beyond the visible area.
            </div>
          </div>
          <Hinge />
          <MidPanel />
          <div className={cn(styles.keyboardPanel, isMobile && styles.mobile)}>
            {!isMobile && <SidePanel />}
            <Keyboard
              activeKeys={activeKeys}
              octaveRange={{ min: 3, max: 5 }}
              extraKeys={8}
              onKeyDown={setActiveKeys}
              onKeyUp={() => setActiveKeys(null)}
              synth={synthObj}
              view={view}
            />
          </div>
          <FrontPanel />
        </div>
        <Side />
      </Container>
    </>
  );
});

export default Minimoog;
