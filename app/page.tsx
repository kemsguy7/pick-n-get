import AppLayout from "./components/layout/AppLayout";
import HomeHero from "./components/home/HomeHero";
import { HowTO } from "./components/home/HowTo";
import HomeDifference from "./components/home/HomeDifference";
import WhyChoose from "./components/home/WhyChoose";

import EcoProducts from "./components/home/HomeProducts";


export default function Home() {
  return (
    <div> 
      <AppLayout showHeader={true} showFooter={true} showSidebar={false}>
          <HomeHero />
          <HowTO />
          <WhyChoose />
          <EcoProducts />
          <HomeDifference />
        </AppLayout>

    </div>
    
    
  );
}
