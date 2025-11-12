import { Recycle, Handbag } from 'lucide-react';
import Link from 'next/link';

const HomeDifference = () => {
  return (
    <div
      className="py-16 text-center"
      style={{ background: 'var(--secondary-green)', color: 'var(--white)' }}
    >
      <div>
        {' '}
        <h2 className="font-space-grotesk text-#E0F2E9 text-3xl font-medium sm:text-[46px] sm:font-semibold">
          Ready to Make a Difference?{' '}
        </h2>
      </div>
      <div>
        {' '}
        <p className="font-inter mt-6 font-light text-white">
          Join thousands of users who are already earning while helping the <br />
          environment. Start your recycling journey today.{' '}
        </p>
      </div>

      {/* Buttons */}
      <div className="animate-fade-in-up animation-delay-600 mx-auto my-8 flex w-[90%] flex-col justify-center gap-4 sm:my-10 sm:flex-row sm:items-center sm:gap-6">
        <Link href="/recycle">
          <button className="font-space-grotesk flex min-w-[200px] transform items-center justify-center gap-3 rounded-lg bg-white px-5 py-4 text-lg leading-6 font-medium text-[#1ED760] transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <Recycle className="text-primary-green h-5 w-5" />
            Start Recycle
          </button>
        </Link>

        <Link href="/shop">
          <button className="font-space-grotesk flex min-w-[180px] transform items-center justify-center gap-3 rounded-lg border border-gray-700 bg-black px-5 py-4 text-lg leading-6 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-900">
            <Handbag className="h-6 w-6" />
            Explore Shop
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomeDifference;
