import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">GP Tech Academy</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed">
              Empowering the next generation of tech leaders through industry-aligned education and real-world experience.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <Link to="/courses" className="hover:opacity-100 transition">Courses</Link>
              <Link to="/#internships" className="hover:opacity-100 transition">Internships</Link>
              <Link to="/#about" className="hover:opacity-100 transition">About Us</Link>
              <Link to="/login" className="hover:opacity-100 transition">Student Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Courses</h4>
            <div className="flex flex-col gap-2 text-sm opacity-70">
              <span>AI & Prompt Engineering</span>
              <span>Full Stack Development</span>
              <span>Digital Marketing</span>
              <span>Cyber Security</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm opacity-70">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@gptechacademy.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>www.gptechacademy.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-sm opacity-50">
          © {new Date().getFullYear()} GP Tech Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
