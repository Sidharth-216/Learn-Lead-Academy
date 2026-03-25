import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CourseCategorySection from "@/components/CourseCategorySection";
import InternshipSection from "@/components/InternshipSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CourseCategorySection />
      <InternshipSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
