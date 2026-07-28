import SectionHeader from './framework/SectionHeader.jsx';
import CategoryCard from './ui/CategoryCard.jsx';

const FeaturedCategories = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <>
      <SectionHeader
        title="Shop by Category"
        subtitle="Find the perfect gift type"
        ctaText="View all"
        ctaLink="/categories"
      />

      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible lg:grid-cols-6">
        {categories.slice(0, 6).map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            className="w-32 shrink-0 sm:w-auto"
          />
        ))}
      </div>
    </>
  );
};

export default FeaturedCategories;
