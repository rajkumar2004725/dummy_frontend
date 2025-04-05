import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Share2 } from 'lucide-react';
import MyGiftCards from './MyGiftCards';

const Profile = () => {
  const [address, setAddress] = useState('0x2937...ee92'); // Replace with actual wallet address

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <main>
        {/* Profile Header */}
        <div className="w-full h-48 bg-gradient-to-br from-amber-500/20 to-purple-600/20" />
        
        <div className="container mx-auto px-4 -mt-20">
          {/* Profile Info */}
          <div className="flex items-end gap-6 mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-purple-600" />
            <div className="flex-1 mb-4">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold">--</h2>
                <button className="p-1.5 rounded-md bg-white/5 hover:bg-white/10">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{address}</span>
                <button className="p-1 hover:text-white">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium">
                Profile settings
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="border-b border-white/10 bg-transparent w-full justify-start h-auto p-0 mb-8">
              <TabsTrigger 
                value="inventory" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger 
                value="listings" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Manage listings
              </TabsTrigger>
              <TabsTrigger 
                value="activities" 
                className="px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent"
              >
                Activities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <MyGiftCards />
            </TabsContent>

            <TabsContent value="listings">
              <div className="text-center py-12 text-gray-500">
                No listings yet
              </div>
            </TabsContent>

            <TabsContent value="activities">
              <div className="text-center py-12 text-gray-500">
                No recent activities
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
