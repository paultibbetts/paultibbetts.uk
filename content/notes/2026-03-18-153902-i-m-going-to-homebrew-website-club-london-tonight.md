+++
date = '2026-03-18T16:00:00Z'
draft = false
title = ""
tags = ['Homebrew Website Club']
+++

<p class="p-summary">
	<span class="hidden"><span class="p-rsvp">Yes</span>, </span>I'm going to  
	<a href="https://events.indieweb.org/2026/03/homebrew-website-club-europe-london-0EMPkdPMzZKX" class="u-in-reply-to">Homebrew Website Club London tonight</a>.
</p>

<!--more-->

I get inspired by many things mentioned at [HWC](https://indieweb.org/Homebrew_Website_Club), but somehow the first to make it to my blog, based on a comment from the last meetup, is this:

<style>
  .h-entry.notes [data-morse-start],
  .h-entry.notes [data-morse-stop] {
    cursor: pointer;
  }

  .h-entry.notes [data-morse-start]:disabled,
  .h-entry.notes [data-morse-stop]:disabled {
    cursor: default;
    opacity: 0.5;
  }

  .h-entry.notes pre:has(code.language-morse),
  .h-entry.notes pre:has(code[data-lang="morse"]) {
    overflow-x: hidden;
  }

  .h-entry.notes pre code.language-morse,
  .h-entry.notes pre code[data-lang="morse"] {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
</style>

<div class="mt-2">
    <div class="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-500">
		<textarea
		    id="morse-input"
		    data-morse-input
		    rows="2"
		    style="width: 100%; margin-top: 0.25rem;"
		    class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
	>Hello, World!</textarea>
	</div>
</div>

```morse

```

<p>
  <button type="button" data-morse-start>📡 Broadcast</button>
</p>
<p>
  <button type="button" data-morse-stop>⏹️ Stop</button>
</p>

<script type="text/javascript">
// It would be cool to say I wrote all of this myself
// but I asked an LLM to do it
// and then I realised it could have been a fun little project.
//
// I will learn from this, and choose my LLM usage
// more carefully in the future.
//
// This is the LLM code.
// I take no credit for writing it, other than
// writing the prompts that resulted in this.
//
// It seems to have come from one or two examples
// that one or two people have made in the past.
// There is one line where the LLM seems to argue with
// itself in the comments (#315).
(() => {
  // International Morse (letters+digits; extend as needed)
  const MORSE = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "'": ".----.",
    "!": "-.-.--",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    "_": "..--.-",
    '"': ".-..-.",
    "$": "...-..-",
    "@": ".--.-."
  };

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function getMorseCodeElement() {
    return document.querySelector("code.language-morse, code[data-lang='morse']");
  }

  function getMorseInputElement() {
    return document.querySelector("[data-morse-input]");
  }

  function getMorseSourceText() {
    const inputEl = getMorseInputElement();
    if (inputEl) {
      const inputText = (inputEl.value || "").trim();
      return inputText || null;
    }

    const codeEl = getMorseCodeElement();
    if (!codeEl) return null;

    if (!codeEl.dataset.morseSource) {
      codeEl.dataset.morseSource = (codeEl.textContent || "").trim();
    }

    return codeEl.dataset.morseSource || null;
  }

  function renderMorseExample() {
    const codeEl = getMorseCodeElement();
    const sourceText = getMorseSourceText();
    if (!codeEl || !sourceText) return null;

    codeEl.textContent = encodeMorse(sourceText);
    return sourceText;
  }

  function encodeMorse(text) {
    const up = text.toUpperCase();
    // Words separated by " / ", letters by spaces
    const words = up.split(/\s+/).filter(Boolean);
    return words.map(word => {
      return word.split("").map(ch => MORSE[ch] ?? "").filter(Boolean).join(" ");
    }).join(" / ");
  }

  function makeBeepEngine() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.value = 0; // start silent
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 650; // Hz
    osc.connect(gain);
    osc.start();

    return {
      ctx,
      async ensureRunning() {
        if (ctx.state !== "running") await ctx.resume();
      },
      on() { gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.005); },
      off() { gain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.005); },
      stop() {
        try { osc.stop(); } catch {}
        ctx.close();
      }
    };
  }

  /**
   * Tap Morse live.
   * Timing is based on "unit" length (dot = 1u, dash = 3u).
   * - intra-symbol gap: 1u
   * - letter gap: 3u
   * - word gap: 7u (we approximate with "/" token)
   */
  async function tapMorse(morse, {
    unitMs = 90,
    useAudio = true,
    useVibrate = false,
    log = true,
    signal = undefined
  } = {}) {
    const engine = useAudio ? makeBeepEngine() : null;
    try {
      if (engine) await engine.ensureRunning();

      const tokens = morse.split(" "); // includes ".", "-", "/" as tokens
      if (log) console.log("[morse] tapping:", morse);

      for (let i = 0; i < tokens.length; i++) {
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

        const t = tokens[i];

        if (t === ".") {
          engine?.on();
          if (useVibrate && navigator.vibrate) navigator.vibrate(unitMs);
          await sleep(unitMs);
          engine?.off();
          await sleep(unitMs); // intra-symbol gap
          continue;
        }

        if (t === "-") {
          engine?.on();
          if (useVibrate && navigator.vibrate) navigator.vibrate(unitMs * 3);
          await sleep(unitMs * 3);
          engine?.off();
          await sleep(unitMs); // intra-symbol gap
          continue;
        }

        if (t === "/") {
          // word gap: 7 units (we already likely had 1 unit after prior symbol)
          await sleep(unitMs * 6);
          continue;
        }

        // Letter boundary: when we see a multi-symbol chunk like ".-.." we won't,
        // because we tokenized by spaces. But we *do* need letter gaps.
        // Our encoding already put spaces between letters, so the token stream
        // is just symbols and "/" — the letter gap is handled by a longer pause
        // when the next token is a symbol but we are at a letter boundary.
        //
        // Easiest: detect original morse string boundaries by using the fact
        // that encodeMorse uses single spaces between letters, and "/" is separate.
        //
        // We already include the 1u intra-symbol gap after each dot/dash, so for
        // letter gap (3u) we add 2u extra when the *next* token is a symbol and
        // we are between letters. We can approximate by looking at the raw string.
      }
    } finally {
      engine?.stop();
    }
  }

  // Slightly better timing: tap by parsing the original morse string
  async function tapMorsePrecise(morse, opts = {}) {
    const {
      unitMs = 90, useAudio = true, useVibrate = false, log = true, signal
    } = opts;

    const engine = useAudio ? makeBeepEngine() : null;
    try {
      if (engine) await engine.ensureRunning();
      if (log) console.log("[morse] tapping:", morse);

      // Parse words split by " / "
      const words = morse.split(" / ").map(w => w.trim()).filter(Boolean);

      for (let w = 0; w < words.length; w++) {
        const letters = words[w].split(" ").map(l => l.trim()).filter(Boolean); // each letter is like ".-"
        for (let l = 0; l < letters.length; l++) {
          if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

          const symbols = letters[l].split("");
          for (let s = 0; s < symbols.length; s++) {
            const sym = symbols[s];
            if (sym === ".") {
              engine?.on();
              if (useVibrate && navigator.vibrate) navigator.vibrate(unitMs);
              await sleep(unitMs);
              engine?.off();
            } else if (sym === "-") {
              engine?.on();
              if (useVibrate && navigator.vibrate) navigator.vibrate(unitMs * 3);
              await sleep(unitMs * 3);
              engine?.off();
            }
            // intra-symbol gap (1u) between parts of same letter
            if (s < symbols.length - 1) await sleep(unitMs);
          }
          // letter gap: 3u (but we've already waited 1u after last symbol? no)
          if (l < letters.length - 1) await sleep(unitMs * 3);
        }
        // word gap: 7u
        if (w < words.length - 1) await sleep(unitMs * 7);
      }
    } finally {
      engine?.stop();
    }
  }

  const START_BUTTON_SELECTOR = "[data-morse-start]";
  const STOP_BUTTON_SELECTOR = "[data-morse-stop]";
  const startButton = document.querySelector(START_BUTTON_SELECTOR);
  const stopButton = document.querySelector(STOP_BUTTON_SELECTOR);

  function setPlayingState(isPlaying) {
    if (startButton) startButton.disabled = isPlaying;
    if (stopButton) stopButton.disabled = !isPlaying;
  }

  // Controller so user can stop it
  let current = null;

  async function playMorse({
    unitMs = 90,
    useAudio = true,
    useVibrate = false,
    log = true
  } = {}) {
    const text = getMorseSourceText();

    if (!text) {
      console.warn("[morse] No morse source code block found.");
      return;
    }

    const morse = encodeMorse(text);

    // Abort previous run if any
    if (current?.controller) current.controller.abort();
    const controller = new AbortController();
    current = { controller };
    setPlayingState(true);

    try {
      await tapMorsePrecise(morse, { unitMs, useAudio, useVibrate, log, signal: controller.signal });
    } catch (e) {
      if (e?.name === "AbortError") {
        if (log) console.log("[morse] stopped.");
        return;
      }
      throw e;
    } finally {
      setPlayingState(false);
    }
  }

  function morseStop() {
    if (current?.controller) current.controller.abort();
    setPlayingState(false);
  }

  const sourceText = renderMorseExample();
  if (!sourceText) {
    console.warn("[morse] Could not render morse example from code block.");
  }

  const inputEl = getMorseInputElement();
  if (inputEl) {
    inputEl.addEventListener("input", () => {
      renderMorseExample();
    });
  }

  setPlayingState(false);

  if (startButton) {
    startButton.addEventListener("click", () => {
      playMorse();
    });
  } else {
    console.warn(`[morse] Start button not found (${START_BUTTON_SELECTOR}).`);
  }

  if (stopButton) {
    stopButton.addEventListener("click", morseStop);
  } else {
    console.warn(`[morse] Stop button not found (${STOP_BUTTON_SELECTOR}).`);
  }
})();
</script>

To make this I was going to need to look up the Morse code alphabet, and then use it as part of a script.

I was feeling lazy so I used an LLM to do that for me, and it ended up writing the whole thing, including turning it into sound, which I hadn't even asked it to do.

It didn't just make it all, in seconds, it ruined any fun I might have had experimenting on a new thing, maybe even learning a thing or two.

So I present it here begrudgingly.

---

I am using this note to test I can send an [RSVP](https://indieweb.org/rsvp).

If you see my name [on this list](https://events.indieweb.org/2026/03/homebrew-website-club-europe-london-0EMPkdPMzZKX#rsvps) then it worked.
