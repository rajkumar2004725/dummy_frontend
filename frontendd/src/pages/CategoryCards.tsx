import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Heart, Send } from 'lucide-react';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';

interface Card {
  id: string;
  title: string;
  image: string;
  price: number;
  creator: string;
  creatorEarnings: string;
  description: string;
  previewImage: string;
}

interface CardModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: Card) => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, isOpen, onClose, onSelect }) => {
  if (!card) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0A0B14] rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 hover:bg-black/60"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="h-72 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B14] to-transparent z-10" />
                <img
                  src={card.previewImage || card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 -mt-16 relative z-20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-medium text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Created by {card.creator}
                    </p>
                  </div>
                  <div className="bg-primary/20 px-6 py-3 rounded-full">
                    <span className="text-primary font-medium text-lg">${card.price}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  {card.description}
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-white font-medium mb-4 text-lg">Card Details</h4>
                  <ul className="space-y-3 text-base text-gray-300">
                    <li className="flex justify-between items-center">
                      <span>Creator Earnings</span>
                      <span className="text-primary font-medium">{card.creatorEarnings}</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Platform Fee</span>
                      <span className="text-secondary font-medium">60%</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={() => onSelect(card)}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Select This Card
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CategoryCards: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Mock data - In real app, this would come from your API
  const cards: Card[] = [
    {
      id: '1',
      title: 'Happy Birthday Bloom',
      image: '/images/cards/birthday-1.jpg',
      previewImage: '/images/cards/birthday-1-preview.gif',
      price: 1.60,
      creator: 'Artist Name',
      creatorEarnings: '40%',
      description: 'A beautiful digital birthday card with animated flowers that bloom as your message is revealed.'
    },
    {
      id: '2',
      title: 'Celebration Time',
      image: '/images/cards/birthday-2.jpg',
      previewImage: '/images/cards/birthday-2-preview.gif',
      price: 1.80,
      creator: 'Artist Name',
      creatorEarnings: '40%',
      description: 'Dynamic celebration card with confetti animation that bursts into life when opened.'
    }
  ];

  const getCategoryName = (id: string): string => {
    const names: { [key: string]: string } = {
      'birthday': 'Birthday Cards',
      'wedding': 'Wedding Cards',
      'newyear': 'New Year Cards',
      'love': 'Love & Romance Cards',
      'appreciation': 'Appreciation Cards',
      'trading-sentiments': 'Trading Sentiment Cards'
    };
    return names[id] || 'Cards';
  };

  const handleCardSelect = (card: Card) => {
    // Handle card selection - navigate to personalization page
    console.log('Selected card:', card);
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] relative">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Navbar */}
      <Navbar />
      
      <div className="content-container relative z-10 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-display font-medium text-white mb-2">
            {getCategoryName(categoryId || '')}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              <div className="relative rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                <div className="relative h-48">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
                    ${card.price}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-medium text-white mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                    {card.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">By {card.creator}</span>
                    <span className="text-primary font-medium">{card.creatorEarnings} royalty</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onSelect={handleCardSelect}
      />
    </div>
  );
};

export default CategoryCards;
