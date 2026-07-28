import DiscoverySection from './DiscoverySection.jsx';
import OccasionCard from './ui/OccasionCard.jsx';

/**
 * "Shop by Occasion" — premium grid cards
 * Uses CatalogMaster system for occasions.
 */
const FeaturedOccasions = ({ items }) => {
  const occasions = (items || []).slice(0, 6);

  if (occasions.length === 0) return null;

  return (
    <DiscoverySection
      title="Shop by Occasion"
      subtitle="Perfect gifts for every celebration"
      layout="grid"
    >
      {occasions.map((item) => (
        <OccasionCard key={item._id} item={item} />
      ))}
    </DiscoverySection>
  );
};

export default FeaturedOccasions;
