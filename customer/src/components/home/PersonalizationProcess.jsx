import { HiOutlineCursorArrowRays, HiOutlinePencilSquare, HiOutlineGiftTop, HiOutlineTruck } from 'react-icons/hi2';

const steps = [
  {
    icon: HiOutlineCursorArrowRays,
    title: 'Choose your gift',
    description: 'Browse our curated collection and pick the perfect piece for the occasion.',
  },
  {
    icon: HiOutlinePencilSquare,
    title: 'Personalize it',
    description: 'Add names, photos, messages, or colors using our live customization options.',
  },
  {
    icon: HiOutlineGiftTop,
    title: 'We craft it',
    description: 'Our team carefully prepares and packages your personalized gift by hand.',
  },
  {
    icon: HiOutlineTruck,
    title: 'It reaches you',
    description: 'Your gift is shipped with tracking so you always know where it is.',
  },
];

const PersonalizationProcess = () => {
  return (
    <section className="border-y border-charcoal/10 bg-white py-14 sm:py-16">
      <div className="container-tgs">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-display text-xl font-semibold text-charcoal sm:text-2xl">How Personalization Works</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-charcoal/60">
            From selection to doorstep, here's how we turn a gift into something truly yours.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <step.icon size={24} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary-600">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold text-charcoal">{step.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizationProcess;
