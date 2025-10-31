import { FooterLink } from '../../types/footerTypes';
import Image from 'next/image';

const platformLinks: FooterLink[] = [
  { id: 1, title: 'Start Recycling', href: '/start-recycling' },
  { id: 2, title: 'Eco Shop ', href: '/pick-shop' },
  { id: 3, title: 'Wallet', href: '/wallet' },
  { id: 4, title: 'Rewards', href: '/rewards' },
];

const supportLinks: FooterLink[] = [
  { id: 5, title: 'Help Center', href: '/help-center' },
  { id: 6, title: 'Contact Us', href: '/contact-us' },
  { id: 7, title: 'Agent Portal', href: '/agent-portal' },
  { id: 8, title: 'Vendor Program', href: '/vendor-program' },
];

const communityLinks: FooterLink[] = [
  { id: 9, title: 'Blog', href: '/blog' },
  { id: 10, title: 'Impact Stories', href: '/impact-stories' },
  { id: 11, title: 'Sustainability Report', href: '/sustainability-report' },
  { id: 12, title: 'Carbon Credits', href: '/carbon-credits' },
];

const Footer = () => {
  function getYear() {
    const date = new Date();
    return date.getFullYear();
  }
  getYear();

  return (
    <footer className="footer-gradient text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              {/*  Logo Icon */}

              <Image src="/EcoCleanLogo.png" width={150} height={150} alt="EcoCleans Logo" />
            </div>

            <p className="mb-6 leading-relaxed text-gray-300">
              Transforming waste into wealth through Web3 technology. Join the circular economy
              revolution.
            </p>

            {/* Stats */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                  <svg
                    className="h-4 w-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-300">
                  125,420kg <br />
                  recycled
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <svg
                    className="h-4 w-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-300">
                  89,340kg CO₂ <br />
                  saved
                </span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-space-grotesk mb-4 font-semibold text-white">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="font-inter font-light text-[#E0F2E9] transition-colors hover:text-green-400"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="font-inter font-light text-[#E0F2E9] transition-colors hover:text-green-400"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Community</h4>
            <ul className="space-y-3">
              {communityLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="font-inter font-normal text-[#E0F2E9] transition-colors hover:text-green-400"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mx-3 mt-12 flex flex-col items-center gap-4 pt-8 md:justify-between lg:flex-row">
        <p className="text-sm text-gray-400">
          © {getYear()} EcoCleans • All Rights Reserved • Built for sustainable, tokenized
          recycling
        </p>

        {/* Badges */}
        <div className="font-roboto mb-6 flex gap-3 text-[#1ED760]">
          <span className="font-roboto text-primary rounded-md border border-[#1DE9B6]/50 bg-black px-3 py-0.5 text-xs font-medium md:text-sm">
            Carbon Neutral Platform
          </span>
          <span className="font-roboto rounded-md border border-[#1DE9B6]/50 bg-black px-3 py-0.5 text-xs font-medium text-blue-400 md:text-sm">
            Web3 Verified
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
