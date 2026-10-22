import { upload } from "@vercel/blob/client";

export type Category = "lesson" | "practice" | "media" | "lab";

export type Resource = {
  id: string;
  label: string;
  category: Category;
  fileUrl?: string;
  fileName?: string;
  hidden?: boolean;
};

export type LevelData = { hidden?: boolean; resources: Resource[] };
export type Manifest = { levels: Record<string, LevelData> };

const STORAGE_KEY = "zitouna-admin-password";

export function getStoredPassword(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storePassword(password: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, password);
  } catch {
    // stockage indisponible (mode privé, etc.) : on continue sans persister
  }
}

export function clearStoredPassword() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await response.json().catch(() => ({}));
  if (response.ok && data.ok) return { ok: true };
  return { ok: false, error: data.error ?? "Mot de passe incorrect." };
}

export async function fetchManifest(): Promise<Manifest> {
  const response = await fetch("/api/content", { cache: "no-store" });
  if (!response.ok) throw new Error("Impossible de charger le contenu du site.");
  return response.json();
}

async function postAction(password: string, action: string, payload: unknown): Promise<Manifest> {
  const response = await fetch("/api/content", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${password}`,
    },
    body: JSON.stringify({ action, payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Une erreur est survenue.");
  return data as Manifest;
}

export async function uploadFile(
  password: string,
  levelId: string,
  file: File,
  onProgress?: (percentage: number) => void
): Promise<{ url: string; fileName: string }> {
  const blob = await upload(`files/${levelId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    clientPayload: JSON.stringify({ password }),
    onUploadProgress: (event) => onProgress?.(event.percentage),
  });
  return { url: blob.url, fileName: file.name };
}

export function addResource(
  password: string,
  levelId: string,
  label: string,
  category: Category,
  file?: { url: string; fileName: string }
) {
  return postAction(password, "addResource", {
    levelId,
    label,
    category,
    fileUrl: file?.url,
    fileName: file?.fileName,
  });
}

export function deleteResource(password: string, levelId: string, resourceId: string) {
  return postAction(password, "deleteResource", { levelId, resourceId });
}

export function toggleResourceHidden(password: string, levelId: string, resourceId: string) {
  return postAction(password, "toggleResourceHidden", { levelId, resourceId });
}

export function toggleLevelHidden(password: string, levelId: string) {
  return postAction(password, "toggleLevelHidden", { levelId });
}

export function updateResourceLabel(password: string, levelId: string, resourceId: string, label: string) {
  return postAction(password, "updateResourceLabel", { levelId, resourceId, label });
}
