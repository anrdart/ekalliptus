import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Trusted Types for DOM XSS prevention
if ((window as any).trustedTypes && (window as any).trustedTypes.createPolicy) {
  (window as any).trustedTypes.createPolicy('default', {
    createHTML: (string: string) => string,
    createScript: (string: string) => string,
    createScriptURL: (string: string) => string
  });
}

createRoot(document.getElementById("root")!).render(<App />);
