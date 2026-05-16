/** Procedural dark ambient drone — no external audio files required. */
let ctx: AudioContext | null = null;
let nodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let masterGain: GainNode | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function startAmbientDrone() {
  const audio = getCtx();
  if (!audio || nodes.length) return;

  masterGain = audio.createGain();
  masterGain.gain.value = 0.08;
  masterGain.connect(audio.destination);

  const freqs = [55, 82.5, 110];
  for (const f of freqs) {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const gain = audio.createGain();
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    nodes.push({ osc, gain });
  }

  const lfo = audio.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = audio.createGain();
  lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();
}

export function stopAmbientDrone() {
  for (const { osc, gain } of nodes) {
    try {
      gain.disconnect();
      osc.stop();
      osc.disconnect();
    } catch {
      /* already stopped */
    }
  }
  nodes = [];
  masterGain = null;
  if (ctx?.state !== "closed") {
    void ctx?.close();
  }
  ctx = null;
}

export async function resumeAudioContext() {
  const audio = getCtx();
  if (audio?.state === "suspended") await audio.resume();
}
