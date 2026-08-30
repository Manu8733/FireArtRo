const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const API = `${BACKEND_URL}/api`;

export class BlogApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "BlogApiError";
    this.status = status;
  }
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new BlogApiError(
      payload.detail || "Conținutul nu a putut fi încărcat.",
      response.status,
    );
  }
  return payload;
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  if (response.status === 204) return null;
  return readJson(response);
}

const adminHeaders = (key, json = false) => ({
  "X-Admin-Key": key,
  ...(json ? { "Content-Type": "application/json" } : {}),
});

export function listPublishedPosts({ limit, signal } = {}) {
  const query = Number.isInteger(limit) ? `?limit=${limit}` : "";
  return jsonRequest(`/blog/posts${query}`, { signal });
}

export function getPublishedPost(slug, { signal } = {}) {
  return jsonRequest(`/blog/posts/${encodeURIComponent(slug)}`, { signal });
}

export function listAdminPosts(key) {
  return jsonRequest("/admin/blog/posts", {
    headers: adminHeaders(key),
  });
}

export function createAdminPost(key, payload) {
  return jsonRequest("/admin/blog/posts", {
    method: "POST",
    headers: adminHeaders(key, true),
    body: JSON.stringify(payload),
  });
}

export function updateAdminPost(key, id, payload) {
  return jsonRequest(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: adminHeaders(key, true),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPost(key, id) {
  return jsonRequest(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: adminHeaders(key),
  });
}

export async function uploadAdminCover(key, preparedImage) {
  const blob = await fetch(preparedImage.dataUrl).then((response) => response.blob());
  const form = new FormData();
  const baseName = String(preparedImage.originalName || "coperta")
    .replace(/\.[^.]+$/, "");
  form.append("file", blob, `${baseName}.webp`);
  return jsonRequest("/admin/blog/media", {
    method: "POST",
    headers: adminHeaders(key),
    body: form,
  });
}

export function blogMediaUrl(mediaId) {
  return mediaId
    ? `${API}/blog/media/${encodeURIComponent(mediaId)}`
    : "";
}

export function splitBlogBody(value) {
  return String(value || "")
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.split(/\r?\n/))
    .filter((lines) => lines.some((line) => line.trim()));
}
