import HomeGallery from "@/components/night/HomeGallery";
import HomePackages from "@/components/night/HomePackages";
import HomeTeam from "@/components/night/HomeTeam";
import HomePartners from "@/components/night/HomePartners";
import HomeBrief from "@/components/night/HomeBrief";
import HomeReviews from "@/components/night/HomeReviews";

export default function HomeRunway() {
  return (
    <div className="fa-home fa-film" data-testid="home-showcase">
      <HomeGallery />
      <HomePackages />
      <HomeTeam />
      <HomePartners />
      <HomeReviews />
      <HomeBrief />
    </div>
  );
}
