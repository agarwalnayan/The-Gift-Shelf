import DiscoverySection from './DiscoverySection.jsx';
import RecipientCard from './ui/RecipientCard.jsx';

/**
 * "Shop by Recipient" — circular icon slider (premium storefront pattern).
 * Uses CatalogMaster system for recipients.
 */
const FeaturedRecipients = ({ items }) => {
  const recipients = (items || []).slice(0, 6);

  if (recipients.length === 0) return null;

  return (
    <DiscoverySection
      title="Shop by Recipient"
      subtitle="Gifts for everyone on your list"
      layout="carousel"
    >
      {recipients.map((item) => (
        <RecipientCard key={item._id} item={item} />
      ))}
    </DiscoverySection>
  );
};

export default FeaturedRecipients;
