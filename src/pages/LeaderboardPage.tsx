import React, { useEffect, useState } from 'react'
import { Trophy, Clock, Star, Crown, Award, Medal } from 'lucide-react'
import { motion } from 'framer-motion';
import { getLeaderboard, Volunteer } from '../api';
import { useSpotlight } from '../hooks/useSpotlight';

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { mousePosition, getGradientStyle, initialGradientStyle } = useSpotlight();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        // Dummy data setup...
        setLeaderboardData(dummyData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboardData();
  }, []);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-800/50 rounded animate-pulse" />
      <div className="bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-700">
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-800/50 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-gray-800/50 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-gray-800/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={mousePosition.x === 50 ? initialGradientStyle : getGradientStyle(mousePosition.x, mousePosition.y)}
      >
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen"
      style={mousePosition.x === 50 ? initialGradientStyle : getGradientStyle(mousePosition.x, mousePosition.y)}
    >
      <motion.div 
        variants={staggerContainer}
        className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8"
      >
        <motion.h1 
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 px-2 sm:px-0"
        >
          Global Leaderboard
        </motion.h1>
        
        <motion.div 
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/30 backdrop-blur-md shadow sm:rounded-lg border border-gray-700 shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700 shadow-md">
              <thead className="bg-gray-800/50 shadow-sm">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Volunteer
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <span className="hidden sm:inline">Hours</span>
                    <Clock className="inline sm:hidden h-4 w-4" />
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <span className="hidden sm:inline">Tasks</span>
                    <Trophy className="inline sm:hidden h-4 w-4" />
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <span className="hidden sm:inline">Rating</span>
                    <Star className="inline sm:hidden h-4 w-4" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {leaderboardData.map((volunteer, index) => (
                  <motion.tr 
                    key={volunteer.id}
                    variants={fadeInUp}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                    whileHover={{ 
                      scale: 1.01, 
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.99 }}
                    className={`${index < 3 ? 'bg-yellow-900/30' : 'bg-gray-800/30'} transition-all duration-200 hover:shadow-lg`}
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-white">{index + 1}</span>
                        {index < 3 && <Trophy className="ml-2 h-4 sm:h-5 w-4 sm:w-5 text-yellow-400" />}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img 
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-blue-500/50" 
                            src={`https://ui-avatars.com/api/?name=${volunteer.name}&background=random`} 
                            alt="" 
                          />
                        </div>
                        <div className="ml-2 sm:ml-4">
                          <div className="text-xs sm:text-sm font-medium text-white">{volunteer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs sm:text-sm text-gray-300">
                        <Clock className="mr-1 sm:mr-2 h-4 sm:h-5 w-4 sm:w-5 text-blue-400" />
                        {volunteer.hours}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                      {volunteer.tasks}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs sm:text-sm text-gray-300">
                        <Star className="mr-1 h-4 sm:h-5 w-4 sm:w-5 text-yellow-400" />
                        {volunteer.rating.toFixed(1)}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default LeaderboardPage;