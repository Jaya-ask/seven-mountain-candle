import Hero from "../Hero/Hero";
import Highlights from "../Highlights/Highlights";

export default function StorefrontPage({
  featured,
  onShopNow
}) {
  return (
    <>
      <Hero
        featured={featured}
        onShopNow={onShopNow}
      />
      <Highlights />
    </>
  );
}
