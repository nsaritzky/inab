import type { Accessor, JSX } from "solid-js";
import { batch, createSignal, onCleanup, onMount } from "solid-js";

enum Status {
  loading = "loading",
  ready = "ready",
  error = "error",
}

export type Options = Readonly<JSX.ScriptHTMLAttributes<HTMLElement>>;

export function useScript(
  src: string,
  options?: Options
): Readonly<[loading: Accessor<boolean>, error: Accessor<ErrorEvent | null>]> {
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<ErrorEvent | null>(null);

  onMount(() => {
    const script = document.createElement("script");

    const onLoad = () => {
      script.dataset.status = Status.ready;
      setLoading(false);
    };

    const onError = (err: ErrorEvent) => {
      script.dataset.status = Status.error;
      batch(() => {
        setLoading(false);
        setError(err);
      });
    };

    const attributes = options || {};

    Object.keys(attributes).forEach((key) => {
      const value = attributes[key];
      if (value) script.setAttribute(key, value);
    });

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    script.dataset.status = "loading";
    script.src = src;

    document.body.appendChild(script);

    onCleanup(() => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      script.remove();
    });
  });

  return [loading, error];
}
