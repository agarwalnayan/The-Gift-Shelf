import { HiOutlineChatBubbleLeftRight, HiOutlineClock, HiOutlineQuestionMarkCircle, HiOutlineArrowRight } from 'react-icons/hi2';

const HelpSupportPage = () => {
  const contactMethods = [
    {
      icon: HiOutlineChatBubbleLeftRight,
      title: 'WhatsApp',
      description: 'Chat with us instantly',
      action: 'https://wa.me/917872030408',
      label: 'Chat on WhatsApp'
    },
    {
      icon: null,
      title: 'Email',
      description: 'support@thegiftshelf.shop',
      action: 'mailto:support@thegiftshelf.shop',
      label: 'Send Email',
      customIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order from the Orders section in your account. We also send tracking details via email and WhatsApp once your order is shipped.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for personalised items and 14 days for non-personalised items. Items must be in their original condition.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 5-7 business days. Express delivery is available in select cities and takes 2-3 business days.'
    },
    {
      question: 'Can I cancel my order?',
      answer: 'Orders can be cancelled within 24 hours of placement. After that, cancellation depends on the production status of your personalised items.'
    }
  ];

  return (
    <div className="container-tgs py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl">Help & Support</h1>
        <p className="mt-2 text-sm text-charcoal/60">We're here to help you with any questions</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Contact Us</h2>
          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-charcoal/10 bg-white p-6 text-left transition-colors duration-300 hover:border-primary-500 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {method.customIcon || <method.icon size={24} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal">{method.title}</p>
                  <p className="mt-1 text-sm text-charcoal/60">{method.description}</p>
                </div>
                <HiOutlineArrowRight size={20} className="shrink-0 text-charcoal/30" />
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <HiOutlineClock size={20} className="text-charcoal/60" />
              <p className="font-medium text-charcoal">Business Hours</p>
            </div>
            <p className="text-sm text-charcoal/60">
              Monday - Saturday: 10:00 AM - 7:00 PM IST<br />
              Sunday: 11:00 AM - 5:00 PM IST
            </p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-charcoal">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-2">
                  <HiOutlineQuestionMarkCircle size={20} className="shrink-0 text-primary-600 mt-0.5" />
                  <p className="font-medium text-charcoal">{faq.question}</p>
                </div>
                <p className="text-sm text-charcoal/60 ml-8">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="/return-policy"
          className="flex items-center justify-between rounded-2xl border border-charcoal/10 bg-white p-6 text-left transition-colors duration-300 hover:border-primary-500 hover:shadow-lg"
        >
          <div>
            <p className="font-medium text-charcoal">Return Policy</p>
            <p className="mt-1 text-sm text-charcoal/60">Learn about our return and refund policy</p>
          </div>
          <HiOutlineArrowRight size={20} className="shrink-0 text-charcoal/30" />
        </a>
        <a
          href="/shipping-policy"
          className="flex items-center justify-between rounded-2xl border border-charcoal/10 bg-white p-6 text-left transition-colors duration-300 hover:border-primary-500 hover:shadow-lg"
        >
          <div>
            <p className="font-medium text-charcoal">Shipping Policy</p>
            <p className="mt-1 text-sm text-charcoal/60">Information about delivery and shipping</p>
          </div>
          <HiOutlineArrowRight size={20} className="shrink-0 text-charcoal/30" />
        </a>
      </div>
    </div>
  );
};

export default HelpSupportPage;
