import DiscoverySection from './DiscoverySection.jsx';
import BudgetCard from './ui/BudgetCard.jsx';

/**
 * "Shop by Budget" section — the 3 admin-managed price tiers
 * Uses BudgetCard component for consistent styling
 */
const BudgetCollections = ({ collections }) => {
  if (!collections || collections.length === 0) return null;

  return (
    <DiscoverySection
      title="Shop by Budget"
      subtitle="Gifts for every price range"
      layout="budget"
    >
      {collections.map((collection) => (
        <BudgetCard key={collection._id} collection={collection} />
      ))}
    </DiscoverySection>
  );
};

export default BudgetCollections;
