import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Check, 
  Globe, 
  Palette, 
  Search, 
  Clock, 
  MessageCircle, 
  Instagram, 
  Linkedin, 
  Mail,
  Phone,
  ExternalLink,
  Users
} from 'lucide-react';
import { 
  doc, 
  increment, 
  onSnapshot, 
  runTransaction 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebase';

function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    // 1. Listen for real-time updates
    const unsubscribe = onSnapshot(doc(db, 'counters', 'visitors'), (snapshot) => {
      if (snapshot.exists()) {
        setCount(snapshot.data().count);
      } else {
        setCount(0);
      }
    }, (error) => {
      console.error("Error fetching visitor count:", error);
    });

    // 2. Sign in anonymously and increment count once per session
    const incrementCounter = async () => {
      if (hasIncremented) return;
      
      try {
        // Wait for auth to be ready if needed, or just sign in
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }

        const counterRef = doc(db, 'counters', 'visitors');
        
        await runTransaction(db, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) {
            transaction.set(counterRef, { count: 1 });
          } else {
            transaction.update(counterRef, { count: increment(1) });
          }
        });
        
        setHasIncremented(true);
        sessionStorage.setItem('visited', 'true');
      } catch (error) {
        // Silently fail if increment fails, we still want to show the count
        console.warn("Visitor increment skipped or failed:", error);
      }
    };

    if (!sessionStorage.getItem('visited')) {
      incrementCounter();
    } else {
      setHasIncremented(true);
    }

    return () => unsubscribe();
  }, [hasIncremented]);

  if (count === null) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-[10px] md:text-xs text-brand-dark/40 font-medium bg-brand-primary/50 px-3 py-1.5 rounded-full border border-brand-accent/5"
    >
      <Users size={12} className="text-brand-accent" />
      <span>{count.toLocaleString()} studio visitors</span>
    </motion.div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    package: 'The Express (From RM 100)',
    message: ''
  });

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Hello Aisyah! I'm interested in a website.

My Details:
Name: ${formData.name}
Email: ${formData.email}
Package: ${formData.package}

Message:
${formData.message}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/60136648159?text=${encodedMessage}`, '_blank');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Process', href: '#process' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="text-2xl font-serif font-semibold tracking-tight text-brand-dark">
            Aisyah Zainal <span className="text-brand-accent italic">Studio</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-brand-dark/70 hover:text-brand-dark transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a href="#contact" className="btn-premium py-2 px-6 text-sm">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-brand-dark"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-primary border-b border-brand-accent/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-lg font-medium text-brand-dark"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <a 
                  href="#contact" 
                  className="btn-premium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-brand-muted/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-[-10%] w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold tracking-widest uppercase mb-6">
              Web Design Excellence
            </span>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6">
              Jom! Build your website in <span className="text-brand-accent italic">30 minutes</span>
            </h1>
            <p className="text-lg text-brand-dark/70 mb-10 max-w-lg leading-relaxed">
              Cepat & Cantik. Elegant, minimalist, and conversion-focused websites for creative professionals and small businesses in Malaysia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="btn-premium flex items-center justify-center gap-2">
                Start Your Project <ArrowRight size={18} />
              </a>
              <a href="#portfolio" className="btn-outline flex items-center justify-center">
                View Portfolio
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-brand-accent/20 bg-white p-2">
              <img 
                src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=800&q=80" 
                alt="Workspace" 
                className="rounded-xl w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute bottom-8 right-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-brand-accent/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-white">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">Fast Delivery</p>
                    <p className="text-sm font-bold">30 Min Setup</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://image2url.com/r2/default/images/1774494591878-8c3aaf8b-6250-4c87-9ca9-c74af9cc46b7.blob" 
              alt="Aisyah Zainal" 
              className="rounded-2xl shadow-xl w-full h-[500px] object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl mb-8 leading-tight">
              The face behind the <span className="text-brand-accent italic">Studio</span>
            </h2>
            <p className="text-lg text-brand-dark/70 mb-6 leading-relaxed">
              Hi, I'm Aisyah. Based in the heart of Bangsar, I believe that a great website shouldn't take months to build or cost a fortune. My mission is to help Malaysian entrepreneurs launch their digital homes quickly without sacrificing elegance or quality.
            </p>
            <p className="text-lg text-brand-dark/70 mb-10 leading-relaxed">
              With over 5 years of experience in minimalist design, I focus on what truly matters: your message, your brand, and your results.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-serif text-brand-accent mb-1">50+</h4>
                <p className="text-sm text-brand-dark/60 uppercase tracking-widest">Projects Done</p>
              </div>
              <div>
                <h4 className="text-3xl font-serif text-brand-accent mb-1">100%</h4>
                <p className="text-sm text-brand-dark/60 uppercase tracking-widest">Happy Clients</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding bg-brand-primary">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl mb-4"
          >
            How I can <span className="text-brand-accent italic">help you</span>
          </motion.h2>
          <p className="text-brand-dark/60 max-w-2xl mx-auto">
            Tailored services designed to elevate your brand and streamline your online presence.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe className="text-brand-accent" size={32} />,
              title: "Web Design",
              desc: "Custom, responsive websites built with a focus on user experience and minimalist aesthetics."
            },
            {
              icon: <Palette className="text-brand-accent" size={32} />,
              title: "Branding",
              desc: "Visual identity design that captures your essence and resonates with your target audience."
            },
            {
              icon: <Search className="text-brand-accent" size={32} />,
              title: "Search SEO",
              desc: "Strategic search engine optimization to ensure your website gets found by the right people."
            }
          ].map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-10 rounded-2xl card-hover border border-brand-accent/5"
            >
              <div className="mb-6">{service.icon}</div>
              <h3 className="text-2xl mb-4">{service.title}</h3>
              <p className="text-brand-dark/70 leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4">Selected <span className="text-brand-accent italic">Works</span></h2>
              <p className="text-brand-dark/60 text-lg">Real projects I’ve built for businesses, events, and digital experiences.</p>
              <p className="text-brand-dark/40 text-sm mt-2 font-medium italic">Don’t see your type of website? I can customize based on your needs.</p>
            </div>
            <a href="#contact" className="text-brand-accent font-semibold flex items-center gap-2 hover:gap-4 transition-all group">
              Start Your Project <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              title: "QR Food Ordering System",
              category: "Restaurant / Ordering System",
              badge: "Demo",
              image: "https://image2url.com/r2/default/images/1774495594023-e7475efb-31f3-4ecd-98d4-bb08b0186c27.blob",
              desc: "A QR-based ordering system that allows customers to scan, browse menu items, and place orders seamlessly.",
              demoUrl: "https://qr-food-ordering-system-yzxa-44dnw2ra2-aisyahhhhs-projects.vercel.app/",
              projectUrl: "https://qr-food-ordering-system-yzxa-44dnw2ra2-aisyahhhhs-projects.vercel.app/",
              btnText: "View Demo"
            },
            {
              title: "Open House RSVP Website",
              category: "Event / RSVP Website",
              badge: "Live Project",
              image: "https://image2url.com/r2/default/images/1774495590184-9a6bcca8-1a65-4c02-9fc0-1ba7d715e92b.blob",
              desc: "A modern RSVP website for events with guest confirmation, event details, and location integration.",
              demoUrl: "https://jemputanrumahterbuka.netlify.app/",
              projectUrl: "https://jemputanrumahterbuka.netlify.app/",
              btnText: "View Demo"
            },
            {
              title: "Legal Firm Website",
              category: "Corporate Website",
              badge: "Concept",
              image: "https://image2url.com/r2/default/images/1774495587091-0fd64217-b8b3-4f00-a557-9fc6a3e9cb10.blob",
              desc: "A premium corporate website designed for a legal consultancy with a clean and authoritative layout.",
              demoUrl: "https://templatelegalfirm.netlify.app/",
              projectUrl: "https://templatelegalfirm.netlify.app/",
              btnText: "View Design"
            }
          ].map((project, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="group relative bg-brand-primary/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-brand-accent text-brand-dark text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {project.badge}
                  </span>
                </div>

                {/* Hover Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <p className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{project.category}</p>
                  <h3 className="text-white text-2xl font-serif mb-3 leading-tight">{project.title}</h3>
                  <p className="text-white/80 text-sm mb-6 line-clamp-2 leading-relaxed">{project.desc}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href={project.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-brand-accent text-brand-dark px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white transition-colors"
                    >
                      {project.btnText} <ExternalLink size={14} />
                    </a>
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
                    >
                      View Project
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Static Info (Visible on Mobile/Non-hover) */}
              <div className="p-6 md:group-hover:opacity-0 transition-opacity duration-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">{project.category}</p>
                </div>
                <h3 className="text-xl font-serif mb-2">{project.title}</h3>
                <p className="text-brand-dark/60 text-sm line-clamp-2">{project.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 text-center">
          <p className="text-brand-dark/40 text-sm font-medium">More projects available upon request.</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-brand-primary">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Simple <span className="text-brand-accent italic">Pricing</span></h2>
          <p className="text-brand-dark/60 max-w-2xl mx-auto">
            Start simple. Upgrade anytime. Built for small businesses, personal brands, and events.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "The Express",
              price: "RM 100",
              label: "Fast & Simple",
              desc: "Perfect if you just need a clean, simple website quickly.",
              features: ["1 page website", "Ready template design", "Mobile responsive", "WhatsApp button", "Basic sections (About, Contact)", "Fast setup"],
              highlight: false,
              cta: "Start Now",
              note: "Most clients start here"
            },
            {
              title: "The Business",
              price: "RM 250",
              label: "Most Popular",
              desc: "Great for businesses that want a more complete and professional presence.",
              features: ["2–4 pages", "Contact form", "Services / gallery section", "Clean layout customization", "Basic SEO setup"],
              highlight: true,
              cta: "Choose This"
            },
            {
              title: "Custom Build",
              price: "RM 500+",
              label: "Flexible",
              desc: "For more features, customization, or system-like websites.",
              features: ["5+ pages", "Custom design", "Booking / RSVP / catalog", "Integrations (WhatsApp, payment)", "Revision support"],
              highlight: false,
              cta: "Request Quote"
            }
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-8 rounded-3xl flex flex-col relative ${plan.highlight ? 'bg-brand-dark text-brand-primary shadow-2xl md:scale-105 z-10' : 'bg-white text-brand-dark border border-brand-accent/10'}`}
            >
              {plan.label && (
                <span className={`absolute top-4 right-6 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${plan.highlight ? 'bg-brand-accent text-brand-dark' : 'bg-brand-accent/10 text-brand-accent'}`}>
                  {plan.label}
                </span>
              )}
              <h3 className="text-2xl mb-2 mt-4">{plan.title}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-xs font-semibold opacity-60 mr-1">From</span>
                <span className="text-3xl font-serif font-bold">{plan.price}</span>
              </div>
              <p className={`text-sm mb-8 leading-relaxed ${plan.highlight ? 'text-brand-primary/70' : 'text-brand-dark/70'}`}>{plan.desc}</p>
              
              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-brand-accent text-brand-dark' : 'bg-brand-accent/10 text-brand-accent'}`}>
                      <Check size={10} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <a 
                  href="#contact" 
                  className={`block w-full py-4 rounded-full text-center font-semibold transition-all ${plan.highlight ? 'bg-brand-accent text-brand-dark hover:bg-white' : 'bg-brand-dark text-brand-primary hover:bg-brand-accent'}`}
                >
                  {plan.cta}
                </a>
                {plan.note && (
                  <p className="text-center text-[10px] mt-3 opacity-50 italic">{plan.note}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Optional Add-ons */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h3 className="text-2xl mb-6">Optional Add-ons</h3>
          <p className="text-brand-dark/60 mb-8">Extra features can be added anytime:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Extra page", "Booking / RSVP", "Product catalog", "Payment integration", "Custom design"].map((addon, idx) => (
              <span key={idx} className="px-4 py-2 bg-white rounded-full text-xs font-medium border border-brand-accent/10 flex items-center gap-2">
                <Palette size={14} className="text-brand-accent" /> {addon}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-brand-dark/40 mb-20 italic">
          “Final price depends on pages, features, and customization.”
        </p>

        {/* Conversion CTA */}
        <div className="max-w-3xl mx-auto bg-brand-dark rounded-[2.5rem] p-12 text-center text-brand-primary shadow-2xl">
          <h3 className="text-3xl md:text-4xl mb-4">Not sure what you need?</h3>
          <p className="text-brand-primary/70 mb-10">
            Just WhatsApp me — I’ll guide you based on your business.
          </p>
          <a 
            href={`https://wa.me/60136648159?text=${encodeURIComponent("Hello Aisyah, I’m interested in getting a website.\n\nMy business:\nType of website:\nBudget range:")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-brand-accent text-brand-dark px-10 py-4 rounded-full font-bold hover:bg-white transition-all"
          >
            <MessageCircle size={20} /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="section-padding bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-8">The <span className="text-brand-accent italic">Process</span></h2>
            <div className="space-y-12">
              {[
                { step: "01", title: "Discovery Call", desc: "We discuss your vision, goals, and content in a focused 15-minute call." },
                { step: "02", title: "Design & Build", desc: "I craft your minimalist site with precision, focusing on speed and elegance." },
                { step: "03", title: "Launch", desc: "Your website goes live in as little as 30 minutes after our setup call." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex gap-6"
                >
                  <span className="text-4xl font-serif text-brand-accent/30 font-bold">{item.step}</span>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-brand-dark/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-muted/30 rounded-full blur-2xl" />
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
              alt="Collaboration" 
              className="rounded-2xl shadow-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding bg-brand-primary">
        <div className="max-w-7xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-brand-dark p-12 md:p-20 text-brand-primary">
            <h2 className="text-4xl md:text-5xl mb-8 leading-tight">Let's build something <span className="text-brand-accent italic">beautiful</span></h2>
            <p className="text-brand-primary/70 mb-12 text-lg">
              Ready to launch your website in 30 minutes? Fill out the form or reach out directly.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-brand-accent">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-brand-primary/50 uppercase tracking-widest">Email Me</p>
                  <p className="font-medium">saisyah.zainal@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-brand-accent">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-brand-primary/50 uppercase tracking-widest">Call Me</p>
                  <p className="font-medium">+60 13 664 8159</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-16">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent hover:text-brand-dark transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-accent hover:text-brand-dark transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="md:w-1/2 p-12 md:p-20">
            <form className="space-y-6" onSubmit={handleContactSubmit}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50">Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-brand-primary border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-accent outline-none transition-all" 
                    placeholder="Jane Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-brand-primary border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-accent outline-none transition-all" 
                    placeholder="jane@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50">Package</label>
                <select 
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="w-full bg-brand-primary border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-accent outline-none transition-all appearance-none"
                >
                  <option>The Express (From RM 100)</option>
                  <option>The Business (From RM 250)</option>
                  <option>Custom Build (RM 500+)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50">Message</label>
                <textarea 
                  rows={4} 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-brand-primary border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-accent outline-none transition-all resize-none" 
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>
              <button type="submit" className="btn-premium w-full py-5 text-lg">
                Send to WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-brand-accent/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-serif font-semibold">
            Aisyah Zainal <span className="text-brand-accent italic">Studio</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8 text-sm text-brand-dark/60">
              <a href="#" className="hover:text-brand-dark transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-dark transition-colors">Terms of Service</a>
            </div>
            <VisitorCounter />
          </div>
          <p className="text-sm text-brand-dark/40">
            © 2026 Aisyah Zainal Studio. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/60136648159"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#25D366]/40 transition-shadow"
      >
        <MessageCircle size={32} fill="currentColor" />
      </motion.a>
    </div>
  );
}
