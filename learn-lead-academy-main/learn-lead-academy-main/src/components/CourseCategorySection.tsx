import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Code, Layers, TrendingUp, Terminal, Shield, BookOpen } from "lucide-react";
import { coursesApi } from "@/lib/api";

// Fallback icon map — backend only sends category name strings
// so we map known names to icons, unknown ones get BookOpen
const iconMap: Record<string, React.ElementType> = {
  "Artificial Intelligence": Brain,
  "AI": Brain,
  "AI & Prompt Engineering": Brain,
  "Web Development": Code,
  "Full Stack": Code,
  "MERN Stack": Code,
  "Data Science": TrendingUp,
  "Digital Marketing": TrendingUp,
  "Cybersecurity": Shield,
  "DevOps": Terminal,
  "Cloud": Layers,
  "Python": Terminal,
  "Mobile Development": Layers,
};

// Gradient colors cycling for cards
const gradients = [
  "from-purple-500 to-purple-700",
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-cyan-500 to-cyan-700",
];

const CourseCategorySection = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    coursesApi
      .getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Don't render the section at all while loading or if no categories yet
  if (loading || categories.length === 0) return null;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">
            What We Teach
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mt-3">
            We <span className="text-gradient-gold">Offer</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Industry-aligned courses designed to make you job-ready with hands-on
            projects and expert mentorship.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((name, i) => {
            // Find best matching icon — check if any key is contained in the category name
            const Icon =
              iconMap[name] ??
              Object.entries(iconMap).find(([key]) =>
                name.toLowerCase().includes(key.toLowerCase())
              )?.[1] ??
              BookOpen;

            const gradient = gradients[i % gradients.length];

            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Master {name.toLowerCase()} with real-world projects and expert guidance.
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CourseCategorySection;