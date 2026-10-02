import { useState, useEffect, useRef } from "preact/hooks";

// Subscribe to window events and re-read a value, at most once per frame,
// so a burst of 1000 logs causes one render instead of 1000.
export function useSource(read, events) {
  const [value, setValue] = useState(read);
  const readRef = useRef(read);
  readRef.current = read;

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setValue(readRef.current());
      });
    };
    events.forEach((e) => window.addEventListener(e, schedule));
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      events.forEach((e) => window.removeEventListener(e, schedule));
    };
  }, []);

  return value;
}

const PREFIX = "logtohtml:";

// useState backed by sessionStorage, so the panel survives reloads while debugging
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.sessionStorage.getItem(PREFIX + key);
      return raw == null ? initial : JSON.parse(raw);
    } catch (e) {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {}
  }, [key, value]);

  return [value, setValue];
}

export function useInterval(fn, ms) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    const id = setInterval(() => fnRef.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export function useViewport() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}
