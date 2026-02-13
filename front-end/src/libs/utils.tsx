export const shuffleArray = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes} min ${remainingSeconds < 10 ? "0" : ""}${remainingSeconds} s`;
  return `${seconds} s`;
}

export const normalizeKey = (key: string) => {
  const map: Record<string,string> = {
    control: "ctrl", meta: "cmd", shift: "shift", alt: "alt",
    arrowup: "↑", arrowdown: "↓", arrowleft: "←", arrowright: "→",
    enter: "enter", escape: "esc", backspace: "backspace", delete: "del",
    capslock: "caps lock", tab: "tab", space: "space"
  };
  return map[key.toLowerCase()] || key.toLowerCase();
};

export const dangerousShortcuts = [
  ['ctrl','w'], ['ctrl','r'], ['ctrl','n'],
  ['meta','w'], ['meta','r'], ['control','n'], ['meta','q']
];

export const isDangerousShortcut = (keys: string[]) => {
  const set = new Set(keys.map(k => k.toLowerCase()));
  return dangerousShortcuts.some(combo => combo.every(k => set.has(k)));
};
