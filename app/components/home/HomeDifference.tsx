import { Recycle, Handbag } from "lucide-react";

const HomeDifference = () => {

    return(
        <div className="py-16 text-center" style={{ background: 'var(--secondary-green)', color: 'var(--white)' }}>

            <div> <h2 className="text-3xl sm:text-[46px] font-space-grotesk font-medium sm:font-semibold text-#E0F2E9">Ready to Make a Difference? </h2></div>
            <div> <p className="font-light mt-6 text-white font-inter">Join thousands of users who are already earning while helping the <br/>environment. Start your recycling journey today. </p></div>

            {/* Buttons */}
            <div className="flex flex-col mx-auto w-[90%]  my-8 sm:my-10  sm:items-center justify-center sm:flex-row gap-4 sm:gap-6 animate-fade-in-up animation-delay-600">
              <button className="
                bg-white font-space-grotesk font-medium text-lg leading-6
                px-5  py-4 rounded-lg text-[#1ED760] hover:shadow-xl
                transform hover:scale-105 transition-all duration-300
                flex items-center justify-center gap-3 min-w-[200px]
              ">
                <Recycle className="w-5 h-5  text-primary-green" />
                Start Recycle 
              </button>
              
              <button className="
                bg-black font-space-grotesk font-medium text-lg leading-6
                px-5 py-4 rounded-lg text-white border border-gray-700
                hover:bg-gray-900 transform hover:scale-105 transition-all duration-300
                flex items-center justify-center gap-3 min-w-[180px]
              ">
                <Handbag className="w-6 h-6" />
                Explore Shop
              </button>
            </div>
        </div>
    )
}

export default HomeDifference;
