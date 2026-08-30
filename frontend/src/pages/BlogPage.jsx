import { useEffect, useMemo, useState } from "react";
import BlogCard from "@/components/blog/BlogCard";
import NightButton from "@/components/night/NightButton";
import Navbar from "@/components/site/Navbar";
import PageEnd from "@/components/site/PageEnd";
import ScrollProgress from "@/components/site/ScrollProgress";
import { SITE_DETAILS } from "@/data/businessContent";
import usePageMeta from "@/hooks/usePageMeta";
import { listPublishedPosts } from "@/lib/blogApi";

export default function BlogPage() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    loading: true,
    posts: [],
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: "" }));
    listPublishedPosts({ signal: controller.signal })
      .then((posts) => setState({ loading: false, posts, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({
            loading: false,
            posts: [],
            error: "Articolele nu au putut fi încărcate.",
          });
        }
      });
    return () => controller.abort();
  }, [requestVersion]);

  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog FireArtRo",
    url: `${SITE_DETAILS.siteUrl}/blog`,
    blogPost: state.posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.published_at,
      url: `${SITE_DETAILS.siteUrl}/blog/${post.slug}`,
    })),
  }), [state.posts]);

  usePageMeta({
    title: "Blog — FireArtRo",
    description:
      "Articole FireArtRo despre spectacole cu drone, artificii și producția evenimentelor.",
    path: "/blog",
    schema,
  });

  return (
    <div className="fa-blog-route">
      <ScrollProgress />
      <Navbar />
      <main className="fa-blog-page" data-design="night-runway">
        <header className="fa-blog-hero">
          <div className="nr-shell">
            <p className="fa-kicker">Jurnal FireArtRo</p>
            <h1>Blog</h1>
            <p>Articole publicate de echipa FireArtRo.</p>
          </div>
        </header>

        <section className="fa-blog-archive nr-section" aria-live="polite">
          <div className="nr-shell">
            {state.loading ? (
              <p className="fa-blog-state" role="status">Se încarcă articolele…</p>
            ) : state.error ? (
              <div className="fa-blog-state is-error">
                <p>{state.error}</p>
                <NightButton
                  onClick={() => setRequestVersion((value) => value + 1)}
                  showArrow={false}
                  variant="secondary"
                >
                  Încearcă din nou
                </NightButton>
              </div>
            ) : state.posts.length === 0 ? (
              <p className="fa-blog-state">Nu există articole publicate momentan.</p>
            ) : (
              <div className="fa-blog-grid">
                {state.posts.map((post) => (
                  <BlogCard article={post} key={post.id} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <PageEnd />
    </div>
  );
}
