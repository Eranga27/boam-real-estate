'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/ui/SearchBar';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Button } from '@/components/ui/Button';
import { Building2, Shield, Key, MapPin, Star, TrendingUp, Users, Home, Search } from 'lucide-react';

const MOCK_PROPERTIES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
    price: '$2,500,000',
    title: 'Modern Luxury Villa',
    address: 'Beverly Hills, CA 90210',
    beds: 5,
    baths: 6,
    sqft: 6500,
    type: 'sale' as const,
    isFeatured: true,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    price: '$4,500/mo',
    title: 'Downtown Penthouse',
    address: 'Manhattan, NY 10001',
    beds: 2,
    baths: 2,
    sqft: 1800,
    type: 'rent' as const,
    isFeatured: false,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800',
    price: '$1,250,000',
    title: 'Contemporary Family Home',
    address: 'Austin, TX 78701',
    beds: 4,
    baths: 3,
    sqft: 3200,
    type: 'sale' as const,
    isFeatured: true,
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"
            alt="Luxury Home"
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Find Your Perfect Property <br/>
            <span className="text-accent">With Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Discover the most exclusive properties in top locations. Buy, sell, or rent with the leading real estate experts.
          </p>
          <SearchBar />
        </motion.div>
      </section>

      {/* 2. Featured Properties */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Featured Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Handpicked exclusive properties by our expert agents for you to explore.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PROPERTIES.map((prop, index) => (
              <motion.div 
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard {...prop} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">View All Featured</Button>
          </div>
        </div>
      </section>

      {/* 3. Latest Listings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Latest Listings</h2>
              <p className="text-gray-600">Explore the newest properties added to our platform.</p>
            </div>
            <Button variant="ghost">See all listings →</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PROPERTIES.slice(0, 3).reverse().map(prop => (
              <PropertyCard key={prop.id} {...prop} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Boam Real-Estates</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">We provide a seamless and secure experience for all your real estate needs.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div 
              whileHover={{ y: -10 }}
              className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 transition-colors duration-300 hover:bg-white/10"
            >
              <div className="w-16 h-16 mx-auto bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted & Secure</h3>
              <p className="text-gray-300 text-sm">Every property and agent is thoroughly verified to ensure maximum security and trust.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-secondary/20 text-secondary rounded-full flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Properties</h3>
              <p className="text-gray-300 text-sm">Access to an exclusive collection of luxury homes and commercial spaces globally.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Agents</h3>
              <p className="text-gray-300 text-sm">Our top-tier agents provide personalized guidance tailored to your unique requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Your journey to finding the perfect property in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px] bg-gray-200" />
            
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-light-gray mb-6">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">1. Search Properties</h3>
              <p className="text-gray-500 text-sm">Use our advanced filters to find properties that match your exact criteria.</p>
            </div>
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-light-gray mb-6 scale-110">
                <Home className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">2. Visit Properties</h3>
              <p className="text-gray-500 text-sm">Schedule viewings and visit your favorite properties with our experts.</p>
            </div>
            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-light-gray mb-6">
                <Key className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">3. Close the Deal</h3>
              <p className="text-gray-500 text-sm">Seamlessly complete the paperwork and get the keys to your new home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Popular Locations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Popular Locations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore properties in the most sought-after cities and neighborhoods.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
            <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000" alt="New York" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-3xl font-bold text-white mb-2">New York</h3>
                <p className="text-gray-200">1,240 Properties</p>
              </div>
            </div>
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1000" alt="Los Angeles" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Los Angeles</h3>
                <p className="text-gray-200">850 Properties</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1531218150217-5afc461afac8?auto=format&fit=crop&q=80&w=800" alt="Miami" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1">Miami</h3>
                <p className="text-gray-200">420 Properties</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1550664890-c5e34a6cad31?auto=format&fit=crop&q=80&w=800" alt="Chicago" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1">Chicago</h3>
                <p className="text-gray-200">310 Properties</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5. Customer Testimonials */}
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Customer Testimonials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear what our satisfied clients have to say about their experience with Boam Real-Estates.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item, i) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex gap-1 text-accent mb-4">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-600 mb-6 italic">"The process of finding our dream home was incredibly smooth. The team at Boam Real-Estates truly understands the market and went above and beyond for us."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Jenkins</h4>
                    <p className="text-sm text-gray-500">Homeowner</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Statistics Section */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-20 -left-20" />
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-20 -right-20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">15K+</div>
              <div className="text-secondary-foreground/80 font-medium">Happy Customers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-secondary-foreground/80 font-medium">Properties Sold</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99%</div>
              <div className="text-secondary-foreground/80 font-medium">Success Rate</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-secondary-foreground/80 font-medium">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call to Action */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to find your dream home?</h2>
              <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied homeowners who found their perfect match through Boam Real-Estates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="accent" size="lg" className="px-8 py-4 text-lg">Browse Properties</Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg bg-white/10 text-white border-white/20 hover:bg-white hover:text-primary">Contact an Agent</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
