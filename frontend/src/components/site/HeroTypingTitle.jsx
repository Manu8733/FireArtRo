import { useEffect, useRef, useState } from "react";
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
  const initialCharacterPending = useRef(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    if (reduceMotion) return undefined;

    const targetWord = KEYWORDS[wordIndex];
    const targetLength = Array.from(targetWord).length;
    const displayedLength = Array.from(displayedWord).length;
    let timeoutId;

    if (phase === "typing") {
      const delay = initialCharacterPending.current ? INITIAL_DELAY : TYPE_DELAY;
      timeoutId = window.setTimeout(() => {
        initialCharacterPending.current = false;
        const nextLength = displayedLength + 1;
        setDisplayedWord(sliceCharacters(targetWord, nextLength));
        if (nextLength === targetLength) setPhase("holding");
      }, delay);
    } else if (phase === "holding") {
      timeoutId = window.setTimeout(() => setPhase("deleting"), HOLD_DELAY);
    } else if (phase === "deleting") {
      timeoutId = window.setTimeout(() => {
        const nextLength = displayedLength - 1;
        setDisplayedWord(sliceCharacters(targetWord, nextLength));
        if (nextLength === 0) setPhase("paused");
      }, DELETE_DELAY);
    } else {
      timeoutId = window.setTimeout(() => {
        setWordIndex((currentIndex) => (currentIndex + 1) % KEYWORDS.length);
        setPhase("typing");
      }, PAUSE_DELAY);
    }

    return () => window.clearTimeout(timeoutId);
  }, [displayedWord, phase, reduceMotion, wordIndex]);

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
