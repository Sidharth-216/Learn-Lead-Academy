import { motion } from "framer-motion";
import { ArrowRight, Award, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-hero opacity-80" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(42_90%_55%/0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(265_70%_60%/0.3),transparent_60%)]" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-purple-glow/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* ISO Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8"
          >
            <Award className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">ISO Certified Institute</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-900 text-5xl md:text-7xl leading-tight text-primary-foreground mb-4"
          >
            Learn Today{" "}
            <span className="text-gradient-gold">Lead Tomorrow</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl font-display font-semibold text-primary-foreground/90 mb-4"
          >
            Start Your Career with In-Demand Skills
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Learn from industry experts, work on real-world projects, and gain internship opportunities 
            that accelerate your career in tech. Join thousands of successful graduates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/login?tab=signup">
              <Button
                size="lg"
                className="bg-gold-gradient text-accent-foreground font-display font-bold text-lg px-8 py-6 rounded-full shadow-gold animate-pulse-gold hover:scale-105 transition-transform"
              >
                Join Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button
                size="lg"
                className="bg-gold-gradient text-accent-foreground font-display font-bold text-lg px-8 py-6 rounded-full shadow-gold hover:scale-105 transition-transform"
              >
                Explore Courses
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { icon: Users, value: "10K+", label: "Students" },
              { icon: BookOpen, value: "50+", label: "Courses" },
              { icon: Award, value: "95%", label: "Placement" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display font-bold text-2xl text-primary-foreground">{stat.value}</p>
                <p className="text-sm text-primary-foreground/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
