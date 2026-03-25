import { motion } from "framer-motion";
import { Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  "Work on live industry projects",
  "Get certified upon completion",
  "Mentorship from senior professionals",
  "Letter of recommendation",
  "Flexible remote & on-site options",
  "Potential full-time conversion",
];

const InternshipSection = () => {
  return (
    <section id="internships" className="py-24 bg-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(42_90%_55%/0.08),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">Career Boost</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-primary-foreground mt-3 mb-6">
              Internship <span className="text-gradient-gold">Opportunities</span>
            </h2>
            <p className="text-primary-foreground/70 mb-8 leading-relaxed">
              Bridge the gap between learning and earning. Our internship program connects you 
              with top companies, giving you the real-world experience employers demand.
            </p>
            <div className="grid gap-3 mb-8">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-primary-foreground/80 text-sm">{b}</span>
                </div>
              ))}
            </div>
            <Link to="/login?tab=signup">
              <Button size="lg" className="bg-gold-gradient text-accent-foreground font-display font-bold rounded-full px-8">
                Apply for Internship
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-3xl bg-accent/10 border border-accent/20 backdrop-blur-sm flex items-center justify-center">
                <Briefcase className="w-32 h-32 text-accent/40" />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gold-gradient shadow-gold flex items-center justify-center animate-float">
                <span className="font-display font-bold text-2xl text-accent-foreground">100+</span>
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-card shadow-elevated">
                <span className="font-display font-semibold text-sm text-foreground">Partner Companies</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InternshipSection;
