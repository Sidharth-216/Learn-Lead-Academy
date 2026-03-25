export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  lessons: number;
  rating: number;
  students: number;
  price: number;
  image: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export const courses: Course[] = [
  {
    id: "1",
    title: "AI & Prompt Engineering Masterclass",
    category: "AI & Prompt Engineering",
    description: "Master the art of AI prompt engineering. Learn to leverage ChatGPT, Midjourney, and other AI tools to boost productivity and create innovative solutions.",
    instructor: "Dr. Priya Sharma",
    duration: "8 weeks",
    lessons: 42,
    rating: 4.9,
    students: 1250,
    price: 4999,
    image: "/placeholder.svg",
    icon: "Brain",
  },
  {
    id: "2",
    title: "Full Stack Web Development",
    category: "Full Stack Development",
    description: "Build modern web applications from scratch. Master HTML, CSS, JavaScript, React, Node.js, and databases in this comprehensive bootcamp.",
    instructor: "Rahul Verma",
    duration: "12 weeks",
    lessons: 68,
    rating: 4.8,
    students: 2100,
    price: 7999,
    image: "/placeholder.svg",
    icon: "Code",
  },
  {
    id: "3",
    title: "MERN Stack Professional",
    category: "MERN Stack",
    description: "Become a MERN stack expert. Deep dive into MongoDB, Express.js, React, and Node.js with real-world projects and deployment strategies.",
    instructor: "Amit Patel",
    duration: "10 weeks",
    lessons: 55,
    rating: 4.7,
    students: 1800,
    price: 6999,
    image: "/placeholder.svg",
    icon: "Layers",
  },
  {
    id: "4",
    title: "Digital Marketing Pro",
    category: "Digital Marketing",
    description: "Learn SEO, social media marketing, Google Ads, content strategy, and analytics. Launch and scale digital campaigns that drive results.",
    instructor: "Sneha Kapoor",
    duration: "6 weeks",
    lessons: 36,
    rating: 4.8,
    students: 3200,
    price: 3999,
    image: "/placeholder.svg",
    icon: "TrendingUp",
  },
  {
    id: "5",
    title: "Python Programming Bootcamp",
    category: "Python",
    description: "From beginner to advanced Python. Cover data structures, OOP, web scraping, automation, data science basics, and machine learning fundamentals.",
    instructor: "Dr. Vikram Singh",
    duration: "8 weeks",
    lessons: 48,
    rating: 4.9,
    students: 2800,
    price: 4999,
    image: "/placeholder.svg",
    icon: "Terminal",
  },
  {
    id: "6",
    title: "Cyber Security Essentials",
    category: "Cyber Security",
    description: "Protect systems and networks from cyber threats. Learn ethical hacking, penetration testing, network security, and incident response.",
    instructor: "Karan Mehta",
    duration: "10 weeks",
    lessons: 52,
    rating: 4.7,
    students: 1500,
    price: 5999,
    image: "/placeholder.svg",
    icon: "Shield",
  },
];

export const categories = [
  { name: "AI & Prompt Engineering", icon: "Brain", color: "from-purple-dark to-primary" },
  { name: "Full Stack Development", icon: "Code", color: "from-primary to-purple-light" },
  { name: "MERN Stack", icon: "Layers", color: "from-purple-light to-accent" },
  { name: "Digital Marketing", icon: "TrendingUp", color: "from-accent to-gold-dark" },
  { name: "Python", icon: "Terminal", color: "from-gold-dark to-primary" },
  { name: "Cyber Security", icon: "Shield", color: "from-primary to-purple-dark" },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Ananya Gupta",
    role: "Full Stack Developer at TCS",
    content: "GP Tech Academy transformed my career. The hands-on projects and mentorship helped me land my dream job within 3 months of completing the course.",
    avatar: "",
    rating: 5,
  },
  {
    id: "2",
    name: "Rohan Desai",
    role: "AI Engineer at Infosys",
    content: "The AI & Prompt Engineering course was incredibly comprehensive. The instructors are industry experts who bring real-world experience to every lesson.",
    avatar: "",
    rating: 5,
  },
  {
    id: "3",
    name: "Meera Nair",
    role: "Digital Marketing Manager",
    content: "I went from zero marketing knowledge to managing campaigns for major brands. The internship opportunity was the game-changer for my career.",
    avatar: "",
    rating: 5,
  },
];
