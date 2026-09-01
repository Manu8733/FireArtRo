import { useLayoutEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const KEYWORDS = ["lumină.", "mișcare.", "aer.", "ritm."];
const INITIAL_DELAY = 450;
const TYPE_DELAY = 85;
const HOLD_DELAY = 3200;
const DELETE_DELAY = 55;
const PAUSE_DELAY = 180;

const sliceCharacters = (value, length) => Array.from(value).slice(0, length).join("");

export const HeroTypingTitle = () => {
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState("");
  const [phase, setPhase] = useState("typing");

  useLayoutEffect(() => {
    if (reduceMotion) return undefined;

    let timeoutId = 0;
    let active = true;
    let currentWordIndex = 0;
    let currentWord = "";
    let currentPhase = "typing";

    const publish = () => {
      if (!active) return;
      setWordIndex(currentWordIndex);
      setDisplayedWord(currentWord);
      setPhase(currentPhase);
    };

    const schedule = (delay) => {
      timeoutId = window.setTimeout(() => {
        if (!active) return;

        const targetWord = KEYWORDS[currentWordIndex];

        if (currentPhase === "typing") {
          const nextLength = Array.from(currentWord).length + 1;
          currentWord = sliceCharacters(targetWord, nextLength);
          if (nextLength === Array.from(targetWord).length) currentPhase = "holding";
          publish();
          schedule(currentPhase === "holding" ? HOLD_DELAY : TYPE_DELAY);
          return;
        }

        if (currentPhase === "holding") {
          currentPhase = "deleting";
          publish();
          schedule(DELETE_DELAY);
          return;
        }

        if (currentPhase === "deleting") {
          const nextLength = Math.max(0, Array.from(currentWord).length - 1);
          currentWord = sliceCharacters(targetWord, nextLength);
          if (nextLength === 0) currentPhase = "paused";
          publish();
          schedule(currentPhase === "paused" ? PAUSE_DELAY : DELETE_DELAY);
          return;
        }

        currentWordIndex = (currentWordIndex + 1) % KEYWORDS.length;
        currentWord = "";
        currentPhase = "typing";
        publish();
        schedule(TYPE_DELAY);
      }, delay);
    };

    publish();
    schedule(INITIAL_DELAY);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  const visualWord = reduceMotion ? KEYWORDS[0] : displayedWord;
  const caretVisible = !reduceMotion && (phase === "typing" || phase === "deleting");

  return (
    <h1 id="nr-hero-title" className="nr-hero__title">
      <span className="nr-hero__accessible-title">Spectacole în lumină.</span>
      <span className="nr-hero__title-line" aria-hidden="true">Spectacole</span>
      <span className="nr-hero__title-line" aria-hidden="true">
        în{" "}
        <span className="nr-hero__keyword-slot">
          <span className="nr-hero__keyword-sizer">mișcare.</span>
          <span className="nr-hero__keyword-active">
            <span className="nr-hero__keyword" data-phase={phase}>{visualWord}</span>
            {caretVisible && <span className="nr-hero__caret" aria-hidden="true" />}
          </span>
        </span>
      </span>
    </h1>
  );
};

export default HeroTypingTitle;
