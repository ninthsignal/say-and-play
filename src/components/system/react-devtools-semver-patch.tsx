"use client";

let hasPatched = false;

// Stabilize renderer registration when extensions expect a semver string.
if (typeof window !== "undefined" && !hasPatched) {
  const globalWindow = window as typeof window & {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      registerRenderer?: (renderer: { version?: string }, ...rest: unknown[]) => unknown;
    };
  };
  const hook = globalWindow.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  if (hook?.registerRenderer) {
    const originalRegisterRenderer = hook.registerRenderer.bind(hook);
    hook.registerRenderer = (renderer, ...rest) => {
      if (renderer && typeof renderer.version === "string" && renderer.version.trim() === "") {
        renderer.version = "0.0.0";
      }
      return originalRegisterRenderer(renderer, ...rest);
    };
    hasPatched = true;
  }
}

export function ReactDevtoolsSemverPatch() {
  return null;
}
