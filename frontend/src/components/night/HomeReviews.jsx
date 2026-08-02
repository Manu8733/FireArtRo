import { SOCIAL_LINKS, SITE_DETAILS, TESTIMONIAL_ITEMS } from "@/data/businessContent";
import useManagedContent from "@/hooks/useManagedContent";

const normalizeSource = (value) => String(value || "").trim().toLowerCase();

function ReviewRail({ provider, direction, reviews, href, linkLabel }) {
  if (!reviews.length || !href) return null;

  return (
    <div
      className="fa-home-reviews__lane"
      data-review-provider={provider}
      data-direction={direction}
    >
      <div className="fa-home-reviews__viewport">
        <div className="fa-home-reviews__track">
          {reviews.map((review) => (
            <blockquote data-review-card key={review.id}>
              <p>{review.quote}</p>
              <cite>{review.name}</cite>
            </blockquote>
          ))}
          {reviews.map((review) => (
            <blockquote aria-hidden="true" className="is-clone" key={`${review.id}-clone`}>
              <p>{review.quote}</p>
              <cite>{review.name}</cite>
            </blockquote>
          ))}
        </div>
      </div>
      <a href={href} target="_blank" rel="noopener noreferrer">{linkLabel}</a>
    </div>
  );
}

export default function HomeReviews() {
  const siteDetails = useManagedContent("siteDetails", SITE_DETAILS);
  const socialLinks = useManagedContent("socialLinks", SOCIAL_LINKS);
  const testimonials = useManagedContent("testimonials", TESTIMONIAL_ITEMS);
  const socialMap = Object.fromEntries(socialLinks.map((item) => [item.id, item.href]));
  const verified = testimonials.filter((item) => item?.replaceable === false && item?.quote && item?.name);
  const facebookReviews = verified.filter((item) => normalizeSource(item.source) === "facebook");
  const googleReviews = verified.filter((item) => normalizeSource(item.source) === "google");
  const facebookHref = facebookReviews.length && socialMap.facebook
    ? `${socialMap.facebook.replace(/\/$/, "")}/reviews`
    : "";
  const googleHref = googleReviews.length ? siteDetails.googleReviewsUrl : "";

  if (!facebookHref && !googleHref) return null;

  return (
    <section
      className="fa-home-reviews"
      data-home-scene="reviews"
      data-testid="home-reviews"
      aria-label="Recenzii publice"
    >
      <p className="fa-kicker">Recenzii publice</p>
      <ReviewRail
        provider="facebook"
        direction="right-to-left"
        reviews={facebookReviews}
        href={facebookHref}
        linkLabel="Vezi recenziile pe Facebook"
      />
      <ReviewRail
        provider="google"
        direction="left-to-right"
        reviews={googleReviews}
        href={googleHref}
        linkLabel="Vezi recenziile pe Google"
      />
    </section>
  );
}
