/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3001" // Backend development server
    : ""; // Relative path for production

export default API_BASE_URL;
