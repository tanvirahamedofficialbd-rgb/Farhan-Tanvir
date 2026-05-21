import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Clock, 
  LayoutGrid, 
  Phone, 
  MapPin, 
  User, 
  CheckCircle2, 
  Menu, 
  X,
  ChevronRight,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  ShoppingCart
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'নন-স্টিক কুকওয়্যার সেট',
    category: 'কিচেন সেট',
    price: 2450,
    image: 'https://images.unsplash.com/photo-1584990333910-ef908182ef83?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'মডার্ন ওয়াল ক্লক',
    category: 'হোম ডেকর',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'মসলা রাখার র্যাক',
    category: 'অর্গানাইজার',
    price: 850,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'সিলিকন স্প্যাটুলা সেট',
    category: 'কিচেন সেট',
    price: 650,
    image: 'https://images.unsplash.com/photo-1594385208974-2e75f9d8ad48?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    name: 'মডার্ন ফ্লাওয়ার ভাস',
    category: 'হোম ডেকর',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    name: 'জুতা রাখার র্যাক',
    category: 'অর্গানাইজার',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '7',
    name: 'ডাইনিং টেবিল ম্যাট (৬ পিস)',
    category: 'ডাইনিং',
    price: 950,
    image: 'https://images.unsplash.com/photo-1544145945-f904253d0c7b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '8',
    name: 'স্মার্ট ইলেকট্রিক কেটলি',
    category: 'কিচেন সেট',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '9',
    name: 'ওয়াল আর্ট ফ্রেম',
    category: 'হোম ডেকর',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80'
  }
];

const CATEGORIES = ['সবগুলো', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>('সবগুলো');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [showOrderStep, setShowOrderStep] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'privacy' | 'terms' | 'about' | 'return' | 'delivery' | 'account'>('home');

  const navigateTo = (view: 'home' | 'privacy' | 'terms' | 'about' | 'return' | 'delivery' | 'account') => {
    setCurrentView(view);
    setViewingProduct(null);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = activeCategory === 'সবগুলো' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'name') {
      if (value.length < 3) error = 'নাম অন্তত ৩ অক্ষরের হতে হবে';
    } else if (name === 'phone') {
      if (!/^01[3-9]\d{8}$/.test(value)) error = 'সঠিক মোবাইল নম্বর দিন (১১ ডিজিট)';
    } else if (name === 'address') {
      if (value.length < 10) error = 'বিস্তারিত ঠিকানা দিন';
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const getProductQty = (id: string) => productQuantities[id] || 1;

  const updateProductQty = (id: string, delta: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const addToCart = (product: Product) => {
    const qty = getProductQty(product.id);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
    // Reset quantity after adding to cart
    setProductQuantities(prev => ({ ...prev, [product.id]: 1 }));
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = orderModalProduct?.id === 'cart' 
      ? cart.map(item => `${item.name} (x${item.quantity})`).join(', ')
      : viewingProduct?.name;
    
    const quantity = orderModalProduct?.id === 'cart'
      ? cart.reduce((a, b) => a + b.quantity, 0)
      : getProductQty(viewingProduct?.id || '');

    const total = orderModalProduct?.id === 'cart'
      ? cartTotal
      : (viewingProduct?.price || 0) * getProductQty(viewingProduct?.id || '');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          product,
          quantity,
          total
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setOrderModalProduct(null);
          setViewingProduct(null);
          setShowOrderStep(false);
          setCart([]);
          setFormData({ name: '', phone: '', address: '' });
          setIsCartOpen(false);
        }, 3000);
      } else {
        alert('অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert('সার্ভারে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <ShoppingBag size={24} />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-brand-primary uppercase">
              Next Need
            </span>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <button 
                onClick={() => navigateTo('home')} 
                className={`font-medium transition-colors ${currentView === 'home' ? 'text-brand-primary' : 'hover:text-brand-primary'}`}
              >
                হোম
              </button>
            </li>
            <li>
              <a href="#products" onClick={() => navigateTo('home')} className="font-medium hover:text-brand-primary transition-colors">শপ</a>
            </li>
            <li>
              <button 
                onClick={() => navigateTo('about')} 
                className={`font-medium transition-colors ${currentView === 'about' ? 'text-brand-primary' : 'hover:text-brand-primary'}`}
              >
                আমাদের সম্পর্কে
              </button>
            </li>
            <li className="relative">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
            </li>
          </ul>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-slate-600 relative"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              className="p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 md:hidden p-4 shadow-xl"
            >
              <ul className="flex flex-col gap-4">
                <li><button onClick={() => navigateTo('home')} className="block w-full text-left py-2 font-medium">হোম</button></li>
                <li><a href="#products" onClick={() => { navigateTo('home'); setIsMenuOpen(false); }} className="block py-2 font-medium">শপ</a></li>
                <li><button onClick={() => navigateTo('about')} className="block w-full text-left py-2 font-medium">আমাদের সম্পর্কে</button></li>
                <li><button onClick={() => navigateTo('privacy')} className="block w-full text-left py-2 font-medium">প্রাইভেসি পলিসি</button></li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Section */}
              <section id="home" className="relative h-[300px] md:h-[450px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1920&q=80" 
              alt="Modern Kitchen"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="text-2xl md:text-5xl font-display font-bold text-white leading-tight mb-4 md:mb-6">
                আধুনিক ঘর ও কিচেনের জন্য <span className="text-brand-primary">Next Need</span>
              </h1>
              <p className="text-sm md:text-xl text-slate-200 mb-6 md:mb-8 leading-relaxed max-w-lg">
                সেরা মানের হোম ডেকর এবং কিচেন এক্সেসরিজ এখন আপনার হাতের মুঠোয়।
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#products"
                  className="px-6 py-3 md:px-8 md:py-4 bg-brand-primary text-white rounded-full font-bold text-sm md:text-lg shadow-lg shadow-orange-900/20 hover:bg-orange-600 transition-all flex items-center gap-2 group"
                >
                  শপিং শুরু করুন
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">আমাদের পণ্যসমূহ</h2>
            <div className="w-20 h-1.5 bg-brand-primary mx-auto rounded-full mb-8" />
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    activeCategory === category 
                      ? 'bg-brand-primary text-white shadow-lg shadow-orange-200' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setViewingProduct(product)}
                  className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col cursor-pointer"
                >
                  <div className="h-40 md:h-64 overflow-hidden relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 md:top-4 md:left-4">
                      <span className="px-2 py-0.5 md:px-3 md:py-1 bg-white/90 backdrop-blur-sm text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full text-slate-600">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 line-clamp-1">{product.name}</h3>
                    <span className="text-lg md:text-2xl font-bold text-brand-primary mb-3 md:mb-6 block">৳ {product.price}</span>
                    
                    <div className="mt-auto grid grid-cols-1 gap-2 md:gap-3">
                      <button 
                        className="w-full py-2 md:py-3 bg-brand-primary text-white rounded-lg md:rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-1 md:gap-2 text-xs md:text-base shadow-lg shadow-orange-100"
                      >
                        বিস্তারিত দেখুন
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-brand-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm mb-4">
                  <ShoppingCart size={24} />
                </div>
                <h4 className="font-bold text-sm md:text-base">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">পণ্য হাতে পেয়ে টাকা দিন</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm mb-4">
                  <ArrowRight size={24} />
                </div>
                <h4 className="font-bold text-sm md:text-base">সারা দেশে ডেলিভারি</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">দ্রুততম সময়ে হোম ডেলিভারি</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-sm md:text-base">কোয়ালিটি গ্যারান্টি</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">১০০% অরিজিনাল পণ্য</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm mb-4">
                  <Clock size={24} />
                </div>
                <h4 className="font-bold text-sm md:text-base">৭ দিনের রিপ্লেসমেন্ট</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1">সহজ রিটার্ন পলিসি</p>
              </div>
            </div>
          </div>
        </section>

            {/* Why Choose Us Section */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">কেন আমাদের বেছে নেবেন?</h2>
                  <div className="w-20 h-1.5 bg-brand-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">সেরা মান</h3>
                    <p className="text-slate-600">আমরা প্রতিটি পণ্যের গুণগত মান নিশ্চিত করি যাতে আপনি পান সেরা অভিজ্ঞতা।</p>
                  </div>
                  <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Clock size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">দ্রুত ডেলিভারি</h3>
                    <p className="text-slate-600">অর্ডার করার পর দ্রুততম সময়ের মধ্যে আপনার ঠিকানায় পণ্য পৌঁছে দেওয়া হয়।</p>
                  </div>
                  <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Phone size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">২৪/৭ সাপোর্ট</h3>
                    <p className="text-slate-600">যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিম সবসময় আপনার পাশে আছে।</p>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : currentView === 'privacy' ? (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="py-24 max-w-4xl mx-auto px-4"
          >
            <h1 className="text-4xl font-display font-bold mb-8 text-slate-800">প্রাইভেসি পলিসি</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <p>Next Need-এ আপনার প্রাইভেসির নিরাপত্তা আমাদের অগ্রাধিকার। এই পলিসি বর্ণনা করে আমরা কীভাবে আপনার তথ্য সংগ্রহ এবং ব্যবহার করি।</p>
              <h3 className="text-xl font-bold text-slate-800">তথ্য সংগ্রহ</h3>
              <p>আমরা আপনার নাম, ফোন নম্বর এবং ঠিকানা সংগ্রহ করি শুধুমাত্র অর্ডার ডেলিভারি করার উদ্দেশ্যে।</p>
              <h3 className="text-xl font-bold text-slate-800">তথ্য ব্যবহার</h3>
              <p>আপনার ব্যক্তিগত তথ্য অন্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না। শুধুমাত্র অর্ডার কনফার্মেশন এবং ডেলিভারি স্ট্যাটাস জানানোর জন্য এটি ব্যবহৃত হয়।</p>
            </div>
            <button onClick={() => navigateTo('home')} className="mt-12 flex items-center gap-2 text-brand-primary font-bold">
              <ArrowRight className="rotate-180" size={18} /> শপিং-এ ফিরে যান
            </button>
          </motion.div>
        ) : currentView === 'terms' ? (
          <motion.div
            key="terms"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="py-24 max-w-4xl mx-auto px-4"
          >
            <h1 className="text-4xl font-display font-bold mb-8 text-slate-800">শর্তাবলী ও নিয়ম</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <p>Next Need ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি আমাদের নিচের শর্তাবলীতে সম্মত হচ্ছেন:</p>
              <h3 className="text-xl font-bold text-slate-800">অর্ডার ও পেমেন্ট</h3>
              <p>সকল অর্ডার ক্যাশ অন ডেলিভারি-র মাধ্যমে সম্পন্ন হয়। পণ্য রিসিভ করার সময় ডেলিভারি চার্জ সহ মোট মূল্য পরিশোধ করতে হবে।</p>
              <h3 className="text-xl font-bold text-slate-800">রিপ্লেসমেন্ট পলিসি</h3>
              <p>পণ্য কোনো সমস্যা থাকলে ডেলিভারি পাওয়ার ৩ দিনের মধ্যে আমাদের জানাতে হবে। ৭ দিনের মধ্যে আমরা পণ্য পরিবর্তন করে দেব।</p>
            </div>
            <button onClick={() => navigateTo('home')} className="mt-12 flex items-center gap-2 text-brand-primary font-bold">
              <ArrowRight className="rotate-180" size={18} /> শপিং-এ ফিরে যান
            </button>
          </motion.div>
        ) : currentView === 'return' ? (
          <motion.div
            key="return"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="py-24 max-w-4xl mx-auto px-4"
          >
            <h1 className="text-4xl font-display font-bold mb-8 text-slate-800">রিটার্ন পলিসি</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <p>আমরা গ্রাহক সন্তুষ্টিতে বিশ্বাসী। নিচের নিয়ম অনুযায়ী আপনি পণ্য রিটার্ন করতে পারবেন:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>পণ্য হাতে পাওয়ার ৪৮ ঘণ্টার মধ্যে সমস্যা জানাতে হবে।</li>
                <li>পণ্যটি অব্যবহৃত এবং অরিজিনাল প্যাকিং-এ থাকতে হবে।</li>
                <li>ডেলিভারি ম্যানের সামনে চেক করে সমস্যা পেলে সাথে সাথে রিটার্ন করা সবচেয়ে সহজ।</li>
              </ul>
            </div>
            <button onClick={() => navigateTo('home')} className="mt-12 flex items-center gap-2 text-brand-primary font-bold">
              <ArrowRight className="rotate-180" size={18} /> শপিং-এ ফিরে যান
            </button>
          </motion.div>
        ) : currentView === 'delivery' ? (
          <motion.div
            key="delivery"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="py-24 max-w-4xl mx-auto px-4"
          >
            <h1 className="text-4xl font-display font-bold mb-8 text-slate-800">ডেলিভারি তথ্য</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <p>সারা বাংলাদেশে আমাদের হোম ডেলিভারি সার্ভিস রয়েছে:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>ঢাকার ভেতরে: ২৪-৪৮ ঘণ্টা (ডেলিভারি চার্জ ৭০ টাকা)</li>
                <li>ঢাকার বাইরে: ৩-৫ দিন (ডেলিভারি চার্জ ১৩০ টাকা)</li>
                <li>আমাদের কুরিয়ার পার্টনার: রেডেক্স, পেপারফ্লাই এবং সুন্দরবন।</li>
              </ul>
            </div>
            <button onClick={() => navigateTo('home')} className="mt-12 flex items-center gap-2 text-brand-primary font-bold">
              <ArrowRight className="rotate-180" size={18} /> শপিং-এ ফিরে যান
            </button>
          </motion.div>
        ) : currentView === 'account' ? (
          <motion.div
            key="account"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="py-24 max-w-4xl mx-auto px-4"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 flex items-center gap-6">
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
                <User size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">আমার প্রোফাইল</h1>
                <p className="text-slate-500">আপনার ব্যক্তিগত তথ্য এবং অর্ডার ট্র্যাকিং</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h4 className="font-bold">আমার অর্ডার</h4>
                  <p className="text-xs text-slate-500">০টি অর্ডার</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold">ঠিকানা</h4>
                  <p className="text-xs text-slate-500">কোন ঠিকানা সংরক্ষণ করা নেই</p>
                </div>
              </div>
            </div>

            <button onClick={() => navigateTo('home')} className="mt-12 flex items-center gap-2 text-brand-primary font-bold">
              <ArrowRight className="rotate-180" size={18} /> শপিং-এ ফিরে যান
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="about"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="py-24 max-w-4xl mx-auto px-4"
          >
            <h1 className="text-4xl font-display font-bold mb-8 text-slate-800">আমাদের সম্পর্কে</h1>
            <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
              <p>Next Need একটি বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম যেখানে আপনি পাবেন আধুনিক কিচেন এক্সেসরিজ এবং হোম ডেকর আইটেম।</p>
              <p>আমাদের মূল লক্ষ্য সাশ্রয়ী মূল্যে প্রিমিয়াম কোয়ালিটি পণ্য গ্রাহকদের দোরগোড়ায় পৌঁছে দেওয়া। আমরা আমাদের পণ্যের মানের ব্যাপারে কোনো আপোষ করি না।</p>
              <div className="grid grid-cols-2 gap-8 mt-12">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-brand-primary text-2xl mb-2">৫০০০+</h4>
                  <p className="text-sm">সন্তুষ্ট গ্রাহক</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-brand-primary text-2xl mb-2">৩০০+</h4>
                  <p className="text-sm">প্রিমিয়াম পণ্য</p>
                </div>
              </div>
            </div>
            <button onClick={() => navigateTo('home')} className="mt-12 flex items-center gap-2 text-brand-primary font-bold">
              <ArrowRight className="rotate-180" size={18} /> শপিং-এ ফিরে যান
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigateTo('home')}>
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                  <ShoppingBag size={18} />
                </div>
                <span className="text-xl font-display font-bold tracking-tight uppercase">
                  Next Need
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                সেরা মানের হোম ডেকর এবং কিচেন এক্সেসরিজ এখন আপনার হাতের মুঠোয়। আপনার ঘরকে সাজান আমাদের আধুনিক সংগ্রহ দিয়ে।
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">কুইক লিঙ্কসমূহ</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><button onClick={() => navigateTo('home')} className="hover:text-brand-primary transition-colors">হোম পেজ</button></li>
                <li><a href="#products" onClick={() => navigateTo('home')} className="hover:text-brand-primary transition-colors">আমাদের পণ্য</a></li>
                <li><button onClick={() => navigateTo('about')} className="hover:text-brand-primary transition-colors">আমাদের সম্পর্কে</button></li>
                <li><button onClick={() => setIsCartOpen(true)} className="hover:text-brand-primary transition-colors">শপিং কার্ট</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">পলিসি ও নিয়ম</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><button onClick={() => navigateTo('privacy')} className="hover:text-brand-primary transition-colors">প্রাইভেসি পলিসি</button></li>
                <li><button onClick={() => navigateTo('terms')} className="hover:text-brand-primary transition-colors">শর্তাবলী ও নিয়ম</button></li>
                <li><button onClick={() => navigateTo('return')} className="hover:text-brand-primary transition-colors">রিটার্ন পলিসি</button></li>
                <li><button onClick={() => navigateTo('delivery')} className="hover:text-brand-primary transition-colors">ডেলিভারি তথ্য</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">অফিস ও যোগাযোগ</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-primary shrink-0 mt-1" />
                  <span>লেভেল ৪, গ্রিন টাওয়ার, শান্তিনগর, ঢাকা</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-primary" />
                  +৮৮০ ১৭XXXXXXXX
                </li>
                <li className="mt-6 pt-6 border-t border-slate-800">
                  <p className="text-[10px] italic leading-relaxed text-slate-500">
                    বিগত ৩ বছর ধরে আমরা আপনাদের সেবায় নিয়োজিত আছি।
                  </p>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
            <p>&copy; {new Date().getFullYear()} Next Need - সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex gap-6">
              <button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors">Terms</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-[100] md:hidden">
        <div className="flex items-center justify-around h-16 px-6">
          <button 
            onClick={() => navigateTo('home')} 
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'home' && !viewingProduct ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-bold">হোম</span>
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400 relative"
          >
            <div className="relative">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">কার্ট</span>
          </button>
          <button 
            onClick={() => navigateTo('account')} 
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'account' ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <User size={24} />
            <span className="text-[10px] font-bold">অ্যাকাউন্ট</span>
          </button>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart size={24} className="text-brand-primary" />
                  আপনার শপিং কার্ট
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                    <ShoppingBag size={64} className="mb-4 opacity-20" />
                    <p className="text-lg">আপনার কার্ট খালি</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-brand-primary font-bold"
                    >
                      শপিং শুরু করুন
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <p className="text-brand-primary font-bold">৳ {item.price}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-brand-primary"><Minus size={14} /></button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-brand-primary"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-slate-600 font-medium">মোট পরিমাণ:</span>
                    <span className="text-2xl font-bold text-brand-primary">৳ {cartTotal}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setOrderModalProduct(null); // Signal cart checkout
                      setTimeout(() => setOrderModalProduct({ id: 'cart', name: 'Cart Order', price: cartTotal, category: '', image: '' }), 100);
                    }}
                    className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    চেকআউট করুন
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <AnimatePresence>
        {orderModalProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderModalProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[90] rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-brand-primary p-6 text-white flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-2xl font-display font-bold">অর্ডার কনফার্ম করুন</h2>
                <button 
                  onClick={() => setOrderModalProduct(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">অর্ডার সফল হয়েছে!</h3>
                      <p className="text-slate-600">ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {/* Order Summary */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">আপনার অর্ডার</p>
                        {orderModalProduct.id === 'cart' ? (
                          <div className="space-y-2">
                            {cart.map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-bold">৳ {item.price * item.quantity}</span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-brand-primary">
                              <span>মোট</span>
                              <span>৳ {cartTotal}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                              <img src={orderModalProduct.image} alt={orderModalProduct.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{orderModalProduct.name}</p>
                              <p className="text-brand-primary font-bold">৳ {orderModalProduct.price}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <User size={16} className="text-brand-primary" />
                            আপনার নাম
                          </label>
                          <input 
                            type="text" 
                            name="name"
                            required 
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="নাম লিখুন"
                            className={`w-full px-4 py-3 rounded-xl border ${formErrors.name ? 'border-red-500' : 'border-slate-200'} focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all`}
                          />
                          {formErrors.name && <p className="text-red-500 text-[10px] font-medium pl-1">{formErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Phone size={16} className="text-brand-primary" />
                            মোবাইল নম্বর
                          </label>
                          <input 
                            type="tel" 
                            name="phone"
                            required 
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="০১৭XXXXXXXX"
                            className={`w-full px-4 py-3 rounded-xl border ${formErrors.phone ? 'border-red-500' : 'border-slate-200'} focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all`}
                          />
                          {formErrors.phone && <p className="text-red-500 text-[10px] font-medium pl-1">{formErrors.phone}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <MapPin size={16} className="text-brand-primary" />
                          ডেলিভারি ঠিকানা
                        </label>
                        <textarea 
                          name="address"
                          required 
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="গ্রাম/রাস্তা, থানা, জেলা"
                          className={`w-full px-4 py-3 rounded-xl border ${formErrors.address ? 'border-red-500' : 'border-slate-200'} focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none`}
                        />
                        {formErrors.address && <p className="text-red-500 text-[10px] font-medium pl-1">{formErrors.address}</p>}
                      </div>

                      <button 
                        type="submit"
                        disabled={Object.values(formErrors).some(err => err !== '') || !formData.name || !formData.phone || !formData.address}
                        className="w-full py-4 bg-brand-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                      >
                        অর্ডার কনফার্ম করুন
                        <ChevronRight size={20} />
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Details & Order Page (Full Screen) */}
      <AnimatePresence>
        {viewingProduct && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-white z-[100] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
              <button 
                onClick={() => {
                  if (showOrderStep) {
                    setShowOrderStep(false);
                  } else {
                    setViewingProduct(null);
                  }
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 font-bold text-slate-600"
              >
                {showOrderStep ? <ArrowRight className="rotate-180" size={24} /> : <X size={24} />}
                {showOrderStep ? 'পেছনে যান' : 'ফিরে যান'}
              </button>
              <h2 className="text-xl font-bold text-brand-primary">
                {showOrderStep ? 'অর্ডার তথ্য পূরণ করুন' : 'প্রডাক্ট ডিটেইলস'}
              </h2>
              <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                {!showOrderStep ? (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                  >
                    {/* Product Info */}
                    <div className="space-y-8">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 bg-slate-100 relative group"
                      >
                        <img 
                          src={viewingProduct.image} 
                          alt={viewingProduct.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>

                    <div className="space-y-8">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary text-sm font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
                          {viewingProduct.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{viewingProduct.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                          <p className="text-3xl font-bold text-brand-primary">৳ {viewingProduct.price}</p>
                          <div className="h-8 w-px bg-slate-200" />
                          <p className="text-xl font-bold text-slate-400 line-through">৳ {Math.round(viewingProduct.price * 1.3)}</p>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl mb-8 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">মোট মূল্য (লাইভ)</span>
                            <span className="text-3xl font-black text-brand-primary">৳ {viewingProduct.price * getProductQty(viewingProduct.id)}</span>
                          </div>
                          <div className="hidden md:block">
                            <ShoppingBag className="text-orange-200" size={48} />
                          </div>
                        </div>

                        <div className="prose prose-slate max-w-none mb-10">
                          <p className="text-lg text-slate-600 leading-relaxed">
                            আমাদের এই {viewingProduct.name} আপনার ঘরকে আরও সুন্দর এবং আধুনিক করে তুলবে। এটি উচ্চমানের উপকরণ দিয়ে তৈরি এবং দীর্ঘস্থায়ী ব্যবহারের নিশ্চয়তা দেয়।
                          </p>
                          <ul className="mt-6 space-y-3 text-slate-600 list-none p-0">
                            <li className="flex items-center gap-3">
                              <CheckCircle2 size={20} className="text-brand-secondary" />
                              প্রিমিয়াম কোয়ালিটি ম্যাটেরিয়াল
                            </li>
                            <li className="flex items-center gap-3">
                              <CheckCircle2 size={20} className="text-brand-secondary" />
                              আধুনিক ও আকর্ষণীয় ডিজাইন
                            </li>
                            <li className="flex items-center gap-3">
                              <CheckCircle2 size={20} className="text-brand-secondary" />
                              সহজ পরিষ্কার ও রক্ষণাবেক্ষণ
                            </li>
                          </ul>
                        </div>

                        <div className="flex flex-col items-stretch gap-4 mt-8">
                          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl">
                            <span className="font-bold text-slate-600 ml-2">পরিমাণ বাছাই করুন:</span>
                            <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm">
                              <button 
                                onClick={() => updateProductQty(viewingProduct.id, -1)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-colors"
                              >
                                <Minus size={18} />
                              </button>
                              <span className="font-bold text-xl w-6 text-center">{getProductQty(viewingProduct.id)}</span>
                              <button 
                                onClick={() => updateProductQty(viewingProduct.id, 1)}
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </div>

                          <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowOrderStep(true)}
                            className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 group"
                          >
                            সরাসরি অর্ডার করুন
                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                          </motion.button>
                        </div>

                      </motion.div>
                    </div>

                    {/* Related Products Section */}
                    <div className="lg:col-span-2 mt-12 md:mt-24">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-display font-bold">সম্পর্কিত পণ্যসমূহ</h2>
                        <div className="flex-grow mx-8 h-px bg-slate-100" />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {PRODUCTS
                          .filter(p => p.category === viewingProduct.category && p.id !== viewingProduct.id)
                          .slice(0, 4)
                          .map(related => (
                            <motion.div 
                              key={related.id}
                              whileHover={{ y: -5 }}
                              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group"
                              onClick={() => {
                                setViewingProduct(related);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <div className="aspect-square overflow-hidden bg-slate-50">
                                <img 
                                  src={related.image} 
                                  alt={related.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold text-sm mb-1 line-clamp-1">{related.name}</h4>
                                <p className="text-brand-primary font-bold">৳ {related.price}</p>
                              </div>
                            </motion.div>
                          ))}
                        {PRODUCTS.filter(p => p.category === viewingProduct.category && p.id !== viewingProduct.id).length === 0 && (
                          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            কোন সম্পর্কিত পণ্য পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-3xl mx-auto"
                  >
                    {/* Order Form */}
                    <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">শিপিং ও পেমেন্ট তথ্য</h2>
                        <p className="text-slate-500">নিচের তথ্যগুলো দিয়ে আপনার অর্ডারটি সম্পন্ন করুন</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {isSubmitted ? (
                          <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                          >
                            <div className="w-20 h-20 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">অর্ডার সফল হয়েছে!</h3>
                            <p className="text-slate-600">ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <User size={16} className="text-brand-primary" />
                                আপনার নাম
                              </label>
                              <input 
                                type="text" 
                                name="name"
                                required 
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="আপনার পূর্ণ নাম লিখুন"
                                className={`w-full px-6 py-4 rounded-2xl border ${formErrors.name ? 'border-red-500' : 'border-slate-200'} focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all bg-white`}
                              />
                              {formErrors.name && <p className="text-red-500 text-xs font-medium pl-1">{formErrors.name}</p>}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Phone size={16} className="text-brand-primary" />
                                মোবাইল নম্বর
                              </label>
                              <input 
                                type="tel" 
                                name="phone"
                                required 
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="০১৭XXXXXXXX"
                                className={`w-full px-6 py-4 rounded-2xl border ${formErrors.phone ? 'border-red-500' : 'border-slate-200'} focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all bg-white`}
                              />
                              {formErrors.phone && <p className="text-red-500 text-xs font-medium pl-1">{formErrors.phone}</p>}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <MapPin size={16} className="text-brand-primary" />
                                ডেলিভারি ঠিকানা
                              </label>
                              <textarea 
                                name="address"
                                required 
                                rows={4}
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="বাসা নম্বর, রাস্তা, থানা ও জেলা লিখুন"
                                className={`w-full px-6 py-4 rounded-2xl border ${formErrors.address ? 'border-red-500' : 'border-slate-200'} focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all bg-white resize-none`}
                              />
                              {formErrors.address && <p className="text-red-500 text-xs font-medium pl-1">{formErrors.address}</p>}
                            </div>

                            <div className="pt-4">
                              <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl border border-slate-100">
                                <div>
                                  <p className="text-sm text-slate-500">{viewingProduct.name} x {getProductQty(viewingProduct.id)}</p>
                                  <span className="font-bold text-slate-600 underline">মোট মূল্য:</span>
                                </div>
                                <span className="text-3xl font-bold text-brand-primary">৳ {viewingProduct.price * getProductQty(viewingProduct.id)}</span>
                              </div>
                              <button 
                                type="submit"
                                disabled={Object.values(formErrors).some(err => err !== '') || !formData.name || !formData.phone || !formData.address}
                                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-xl shadow-xl shadow-orange-200 hover:bg-orange-600 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center justify-center gap-3 group"
                              >
                                অর্ডার কনফার্ম করুন
                                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </form>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
