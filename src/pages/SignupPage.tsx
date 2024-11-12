import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, fadeIn } from '../components/animations/AnimationConfig'

const SignupPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.querySelector('.signup-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const container = document.querySelector('.signup-container');
    container?.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const getGradientStyle = (mouseX: number, mouseY: number) => ({
    background: `
      radial-gradient(
        circle at ${mouseX}% ${mouseY}%, 
        rgb(30, 64, 175) 0%,
        rgba(30, 58, 138, 0.9) 20%,
        rgba(23, 37, 84, 0.8) 40%,
        rgba(15, 23, 42, 0.9) 60%,
        rgb(15, 23, 42) 80%
      ),
      linear-gradient(
        45deg,
        rgb(30, 58, 138) 0%,
        rgb(23, 37, 84) 50%,
        rgb(15, 23, 42) 100%
      )
    `
  });

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="signup-container min-h-screen flex items-center justify-center"
      style={getGradientStyle(mousePosition.x, mousePosition.y)}
    >
      <motion.div 
        variants={fadeInUp}
        className="max-w-md w-full bg-gray-800/30 backdrop-blur-md rounded-lg shadow-lg p-8 border border-gray-700"
      >
        <motion.h2 
          variants={fadeIn}
          className="text-3xl font-bold text-center mb-8 text-white"
        >
          Join VolunMatch
        </motion.h2>
        <motion.p
          variants={fadeIn}
          className="text-center text-sm text-gray-300 mb-8"
        >
          Choose how you want to make a difference
        </motion.p>
        
        <div className="mt-8 space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/signup/volunteer"
              className="relative block w-full bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-blue-500 hover:bg-gray-800/70 hover:scale-[1.02]"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlus className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Sign up as a Volunteer
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Find opportunities to help and make a positive impact in your community
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/signup/organization"
              className="relative block w-full bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-blue-500 hover:bg-gray-800/70 hover:scale-[1.02]"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">
                    Sign up as an Organization
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Connect with passionate volunteers and manage your opportunities
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 ease-in-out">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SignupPage