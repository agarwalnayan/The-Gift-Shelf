import { HiOutlineHeart, HiOutlineSparkles, HiOutlineGift } from 'react-icons/hi2';

const AboutPage = () => {
  return (
    <div className="container-tgs py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">About The Gift Shelf</h1>
        <p className="mt-2 text-sm text-charcoal/60">Our story, mission, and vision</p>
      </div>

      <div className="max-w-3xl space-y-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <HiOutlineHeart size={24} />
            </div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">Our Story</h2>
          </div>
          <p className="text-base text-charcoal/70 leading-relaxed">
            The Gift Shelf was born from a simple belief: every gift should tell a story. Founded with a passion for creating meaningful connections through thoughtful gifting, we've curated a collection of premium personalised gifts that transform ordinary moments into extraordinary memories.
          </p>
          <p className="mt-4 text-base text-charcoal/70 leading-relaxed">
            What started as a small idea has grown into a destination for those seeking to express love, gratitude, and celebration through beautifully crafted gifts. Each item in our collection is carefully selected to ensure it meets our standards of quality, craftsmanship, and emotional resonance.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <HiOutlineSparkles size={24} />
            </div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">Our Mission</h2>
          </div>
          <p className="text-base text-charcoal/70 leading-relaxed">
            To make gifting effortless and meaningful by providing premium personalised gifts that celebrate life's special moments. We believe that the perfect gift exists for every occasion, and we're here to help you find it.
          </p>
          <p className="mt-4 text-base text-charcoal/70 leading-relaxed">
            Our mission extends beyond just selling gifts – we aim to be your partner in creating memorable experiences. From the moment you browse our collection to the moment your gift is received, we're committed to excellence in every step of the journey.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <HiOutlineGift size={24} />
            </div>
            <h2 className="font-display text-2xl font-semibold text-charcoal">Our Vision</h2>
          </div>
          <p className="text-base text-charcoal/70 leading-relaxed">
            To become India's most trusted destination for personalised gifting, known for our quality, creativity, and exceptional customer experience. We envision a world where every gift is as unique as the person receiving it.
          </p>
          <p className="mt-4 text-base text-charcoal/70 leading-relaxed">
            We're building a community of gift-givers who understand that the thought behind a gift matters as much as the gift itself. Through continuous innovation and unwavering commitment to quality, we're redefining what it means to give with heart.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-charcoal mb-6">Why Choose The Gift Shelf?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mt-0.5">
                <span className="font-semibold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-charcoal">Premium Quality</p>
                <p className="mt-1 text-sm text-charcoal/60">Every product is carefully curated for exceptional quality and craftsmanship.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mt-0.5">
                <span className="font-semibold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-charcoal">Personalisation</p>
                <p className="mt-1 text-sm text-charcoal/60">Add your personal touch with custom engravings, prints, and messages.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mt-0.5">
                <span className="font-semibold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-charcoal">Thoughtful Curation</p>
                <p className="mt-1 text-sm text-charcoal/60">Our collection is thoughtfully curated to include only the best gifts for every occasion.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 mt-0.5">
                <span className="font-semibold text-sm">4</span>
              </div>
              <div>
                <p className="font-medium text-charcoal">Exceptional Service</p>
                <p className="mt-1 text-sm text-charcoal/60">From ordering to delivery, we're committed to making your experience seamless.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
