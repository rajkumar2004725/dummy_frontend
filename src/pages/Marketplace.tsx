import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Heart, Send, Lock, Star, Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  icon: React.ReactNode;
}

const categories: Category[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    image: '/images/categories/birthday.jpg',
    description: 'Celebrate special days with unique blockchain cards',
    icon: <Gift className="w-6 h-6" />
  },
  {
    id: 'wedding',
    name: 'Wedding',
    image: '/images/categories/wedding.jpg',
    description: 'Commemorate beautiful unions forever on-chain',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'newyear',
    name: 'New Year',
    image: '/images/categories/newyear.jpg',
    description: 'Welcome new beginnings with digital memories',
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    id: 'love',
    name: 'Love & Romance',
    image: '/images/categories/love.jpg',
    description: 'Express your feelings with blockchain permanence',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'appreciation',
    name: 'Appreciation',
    image: '/images/categories/appreciation.jpg',
    description: 'Show gratitude with unique digital cards',
    icon: <Star className="w-6 h-6" />
  },
  {
    id: 'trading-sentiments',
    name: 'Trading Sentiments',
    image: '/images/categories/trading.jpg',
    description: 'Crypto-native cards for the web3 community',
    icon: <Lock className="w-6 h-6" />
  }
];

const Marketplace: React.FC = () => {
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.17, 0.67, 0.83, 0.97]
      }
    })
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      <main className="flex-1 pt-32 pb-20">
        <div className="content-container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUpVariants}
              custom={0}
            >
              <div className="inline-block animate-float">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-secondary/30 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl font-display font-semibold tracking-tight text-white mb-6"
                variants={fadeInUpVariants}
                custom={1}
              >
                Explore Our
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Gift Card Collection
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300"
                variants={fadeInUpVariants}
                custom={2}
              >
                Choose from our curated categories of blockchain-powered greeting cards
              </motion.p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/marketplace/${category.id}`}
                  className="block group"
                >
                  <div className="relative h-64 mb-6 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl font-display font-medium text-white mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {category.description}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center z-20">
                      {React.cloneElement(category.icon as React.ReactElement, {
                        className: 'w-6 h-6 text-white'
                      })}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
