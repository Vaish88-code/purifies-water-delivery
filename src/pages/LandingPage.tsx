import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { 
  Droplets, 
  Truck, 
  RefreshCw, 
  Store, 
  Globe, 
  MapPin, 
  CreditCard,
  Phone,
  Package,
  Calendar,
  Home,
  Users,
  Building2,
  GraduationCap,
  HardHat,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Languages,
  ArrowRight,
  Check,
  X,
  ChevronDown
} from "lucide-react";

const LandingPage = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('trust')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why Trust Us</button>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="water-gradient text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6 animate-slide-up">
                <Droplets className="w-4 h-4" />
                Trusted by 10,000+ families
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up-delay-1">
                Pure Water.{" "}
                <span className="water-gradient-text">Delivered to Your Doorstep.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 animate-slide-up-delay-2">
                Order safe, reliable drinking water from trusted local suppliers — anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up-delay-3">
                <Link to="/register">
                  <Button size="lg" className="water-gradient text-primary-foreground w-full sm:w-auto text-lg px-8">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Water Drop Illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-80 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] animate-float" />
                    <div className="absolute inset-4 bg-gradient-to-b from-primary/30 to-secondary/30 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" />
                    <div className="absolute inset-8 bg-gradient-to-b from-primary/40 to-secondary/40 rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" />
                    <div className="absolute top-12 left-12 w-8 h-8 bg-white/60 rounded-full blur-sm" />
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-10 right-10 p-4 bg-card rounded-xl shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full water-gradient flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Fast Delivery</p>
                      <p className="text-xs text-muted-foreground">Same day service</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-20 left-0 p-4 bg-card rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">100% Safe</p>
                      <p className="text-xs text-muted-foreground">Verified suppliers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-16">
            <button 
              onClick={() => scrollToSection('what-is-purifies')}
              className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm">Learn More</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* What is Purifies Section */}
      <section id="what-is-purifies" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What is <span className="water-gradient-text">Purifies</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Purifies is an online web platform that connects customers with verified local water suppliers for fast, reliable water jar delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Home, label: "Homes", desc: "Daily household needs" },
              { icon: Building2, label: "Offices", desc: "Corporate hydration" },
              { icon: Store, label: "Shops", desc: "Retail businesses" },
              { icon: Users, label: "Small Businesses", desc: "Startups & more" },
            ].map((item, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-2xl water-gradient flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Purifies Section (Problem vs Solution) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="water-gradient-text">Purifies</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Say goodbye to the old hassles of water delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Problems */}
            <Card className="p-8 bg-destructive/5 border-destructive/20">
              <h3 className="text-xl font-bold text-destructive mb-6 flex items-center gap-2">
                <X className="w-6 h-6" />
                The Old Way
              </h3>
              <ul className="space-y-4">
                {[
                  "Calling vendors again and again",
                  "Uncertain delivery times",
                  "No fixed pricing",
                  "No subscription facility",
                  "Language barriers",
                ].map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <span className="text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Solutions */}
            <Card className="p-8 bg-secondary/5 border-secondary/20">
              <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                <Check className="w-6 h-6" />
                The Purifies Way
              </h3>
              <ul className="space-y-4">
                {[
                  "Easy online ordering",
                  "Fixed transparent pricing",
                  "Scheduled & subscription delivery",
                  "Trusted verified suppliers",
                  "Multi-language support",
                ].map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-foreground font-medium">{solution}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="water-gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get pure water delivered in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Phone, step: "01", title: "Register", desc: "Sign up using your phone number" },
              { icon: Package, step: "02", title: "Choose", desc: "Select water jar type & quantity" },
              { icon: Calendar, step: "03", title: "Schedule", desc: "Pick delivery or subscription" },
              { icon: Truck, step: "04", title: "Receive", desc: "Get water delivered to your doorstep" },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                {/* Connector Line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                )}
                
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-3xl water-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key <span className="water-gradient-text">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for hassle-free water delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Truck, title: "Doorstep Delivery", desc: "Get water delivered right to your home or office" },
              { icon: RefreshCw, title: "Subscription Orders", desc: "Set up recurring deliveries and never run out" },
              { icon: Store, title: "Verified Vendors", desc: "All suppliers are verified for quality and reliability" },
              { icon: Globe, title: "Multi-Language", desc: "Use the app in English, Hindi, or Marathi" },
              { icon: MapPin, title: "Order Tracking", desc: "Track your delivery in real-time" },
              { icon: CreditCard, title: "Multiple Payments", desc: "Pay online or cash on delivery" },
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-border/50">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Who Can Use <span className="water-gradient-text">Purifies</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Perfect for everyone who needs reliable water supply
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Users, label: "Households" },
              { icon: Building2, label: "Offices & Shops" },
              { icon: HardHat, label: "Construction Sites" },
              { icon: GraduationCap, label: "Schools & Colleges" },
              { icon: Store, label: "Local Vendors" },
            ].map((item, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Trust <span className="water-gradient-text">Purifies</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built with your safety and convenience in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {[
              { icon: BadgeCheck, label: "Verified Vendors", color: "bg-primary" },
              { icon: CreditCard, label: "Transparent Pricing", color: "bg-secondary" },
              { icon: Clock, label: "On-Time Delivery", color: "bg-primary" },
              { icon: ShieldCheck, label: "Secure Login", color: "bg-secondary" },
              { icon: Languages, label: "Local Language", color: "bg-primary" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <item.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-semibold">{item.label}</h3>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            {["100% Safe Water", "10,000+ Happy Customers", "500+ Verified Vendors", "15+ Cities"].map((badge, index) => (
              <div key={index} className="px-6 py-3 rounded-full bg-accent text-accent-foreground font-medium">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 water-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Start Getting Pure Water the Smart Way
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust Purifies for their daily water needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">
                Register Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Logo size="md" />
              <p className="text-muted-foreground mt-4 max-w-md">
                Pure water delivered to your doorstep. Fast, reliable, and trusted by thousands across India.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('what-is-purifies')} className="text-muted-foreground hover:text-foreground transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-foreground transition-colors">How it Works</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('trust')} className="text-muted-foreground hover:text-foreground transition-colors">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">Register</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link></li>
              </ul>
              <div className="mt-4">
                <LanguageSelector />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Purifies. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with 💧 for India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
