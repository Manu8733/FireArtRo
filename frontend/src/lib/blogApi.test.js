import {
  listAdminPosts,
  listPublishedPosts,
  splitBlogBody,
} from "./blogApi";

const summary = {
  id: "post-1",
  slug: "primul-articol",
  title: "Primul articol",
  excerpt: "Rezumat",
  category: "Noutăți",
  cover_media_id: "",
  cover_alt: "",
  updated_at: "2026-08-30T10:00:00+00:00",
  published_at: "2026-08-30T10:00:00+00:00",
};

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

test("public preview requests exactly limit three and returns API data", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [summary],
  });

  await expect(listPublishedPosts({ limit: 3 })).resolves.toEqual([summary]);
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/blog/posts?limit=3",
    { signal: undefined },
  );
});

test("admin listing sends the supplied key only in X-Admin-Key", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [],
  });

  await listAdminPosts("secret-session-key");

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/admin/blog/posts",
    { headers: { "X-Admin-Key": "secret-session-key" } },
  );
});

test("failed requests expose status and Romanian detail", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ detail: "Acces neautorizat." }),
  });

  await expect(listAdminPosts("wrong")).rejects.toEqual(
    expect.objectContaining({
      name: "BlogApiError",
      status: 401,
      message: "Acces neautorizat.",
    }),
  );
});

test("body splitting preserves text and separates blank-line paragraphs", () => {
  expect(splitBlogBody(
    "Paragraf unu.\nLinia doi.\n\n<script>alert(1)</script>",
  )).toEqual([
    ["Paragraf unu.", "Linia doi."],
    ["<script>alert(1)</script>"],
  ]);
});
