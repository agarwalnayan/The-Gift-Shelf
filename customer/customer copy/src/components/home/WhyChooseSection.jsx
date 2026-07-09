import { HiOutlineSparkles, HiOutlineHandRaised, HiOutlineClock, HiOutlineHeart } from 'react-icons/hi2';

const reasons = [
  {
    icon: HiOutlineSparkles,
    title: 'Thoughtfully curated',
    description: 'Every product is hand-picked for quality and meaning, not mass-produced filler.',
  },
  {
    icon: HiOutlineHandRaised,
    title: 'Made just for you',
    description: 'Deep personalization options mean no two gifts are exactly alike.',
  },
  {
    icon: HiOutlineClock,
    title: 'Reliable timelines',
    description: 'Clear production and delivery estimates so you never miss a moment.',
  },
  {
    icon: HiOutlineHeart,
    title: 'Loved by customers',
    description: 'Thousands of happy occasions celebrated with gifts from The Gift Shelf.',
  },
];

const WhyChooseSection = () => {
  return (
    <section className="container-tgs py-14 sm:py-16">
      <div className="mb-10 text-center sm:mb-12">
        <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">Why Choose The Gift Shelf</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <div key={reason.title} className="rounded-2xl border border-charcoal/10 bg-white p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <reason.icon size={20} />
            </div>
            <p className="mt-4 text-sm font-semibold text-charcoal">{reason.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseSection;
