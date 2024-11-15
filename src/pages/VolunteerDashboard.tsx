import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, MapPin, Users, Filter, Search, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOpportunities, applyForOpportunity, getLeaderboard, type Opportunity, withdrawFromOpportunity } from '../api';

interface CompletedTask {
  id: number;
  title: string;
  date: string;
  hours: number;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  hours: number;
  rank?: number;
}

const VolunteerDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    skills: [] as string[],
    date: ''
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [applicationStatuses, setApplicationStatuses] = useState<{[key: number]: boolean}>({});
  const [withdrawalConfirm, setWithdrawalConfirm] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadOpportunities();
    loadLeaderboard();
    // Mock data for completed tasks
    setCompletedTasks([
      { id: 1, title: 'Community Cleanup', date: '2024-03-15', hours: 4 },
      { id: 2, title: 'Food Bank Volunteer', date: '2024-03-10', hours: 3 },
      { id: 3, title: 'Senior Center Help', date: '2024-03-05', hours: 5 },
    ]);
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await getOpportunities();
      setOpportunities(data);
      
      // Set initial state of applied opportunities
      const applied = new Set(
        data
          .filter(opp => opp.applied)
          .map(opp => opp.id)
      );
      setAppliedOpportunities(applied);
    } catch (error) {
      console.error('Error loading opportunities:', error);
      showNotification('Failed to load opportunities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data.map(v => ({
        id: v.id,
        name: `${v.first_name} ${v.last_name}`,
        hours: v.tasks,
        rank: v.rank
      })));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleApply = async (opportunityId: number) => {
    try {
      const response = await applyForOpportunity(opportunityId);
      
      if (response.status === 'withdrawn') {
        setApplicationStatuses(prev => ({...prev, [opportunityId]: false}));
        setWithdrawalConfirm(null);
        showNotification('Application withdrawn successfully', 'success');
      } else {
        setApplicationStatuses(prev => ({...prev, [opportunityId]: true}));
        showNotification('Application submitted successfully!', 'success');
      }
      
      loadOpportunities(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      showNotification('Operation failed', 'error');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         opp.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || opp.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesDate = !filters.date || opp.date.includes(filters.date);
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => opp.skills_required.includes(skill));
    
    return matchesSearch && matchesLocation && matchesDate && matchesSkills;
  });

  const addRipple = useCallback((x: number, y: number) => {
    const newRipple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples(prevRipples => [...prevRipples, newRipple]);
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dashboard = document.querySelector('.dashboard-container');
      if (dashboard) {
        const rect = dashboard.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top + window.scrollY) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{
          background: `
            radial-gradient(
              circle at 81.4952% 5.51724%, 
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
        }}>
        <div className="w-12 h-12 border-4 border-blue-400 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen"
      style={getGradientStyle(mousePosition.x, mousePosition.y)}
    >
      <div className="dashboard-container relative">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} className="mb-8">
            <motion.div variants={fadeInUp} className="px-4 py-5 sm:px-6">
              <h1 className="text-3xl font-bold text-white">Available Opportunities</h1>
              <p className="mt-1 text-sm text-gray-300">
                Find and apply for volunteer opportunities that match your interests
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="px-4 sm:px-6 mb-6">
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Search</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="bg-gray-700/50 border border-gray-600 text-white rounded-md pl-10 p-2.5 w-full"
                        placeholder="Search opportunities..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                      className="mt-1 bg-gray-700/50 border border-gray-600 text-white rounded-md p-2.5 w-full"
                      placeholder="Filter by location..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Date</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                      className="mt-1 bg-gray-700/50 border border-gray-600 text-white rounded-md p-2.5 w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300">Skills</label>
                    <select
                      multiple
                      value={filters.skills}
                      onChange={(e) => setFilters({
                        ...filters,
                        skills: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="mt-1 bg-gray-700/50 border border-gray-600 text-white rounded-md p-2.5 w-full"
                    >
                      <option value="teaching">Teaching</option>
                      <option value="mentoring">Mentoring</option>
                      <option value="organizing">Organizing</option>
                      <option value="technical">Technical</option>
                      <option value="medical">Medical</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6">
              {filteredOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.id}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/20 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    addRipple(x, y);
                  }}
                >
                  <h3 className="text-lg font-medium text-white mb-2">{opportunity.title}</h3>
                  <p className="text-gray-300 mb-4">{opportunity.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                      {new Date(opportunity.date).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                      {opportunity.location}
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Users className="h-5 w-5 mr-2 text-blue-400" />
                      {opportunity.volunteers_registered} / {opportunity.volunteers_needed} volunteers
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {opportunity.skills_required.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (withdrawalConfirm === opportunity.id) {
                        handleApply(opportunity.id);
                      } else if (applicationStatuses[opportunity.id]) {
                        setWithdrawalConfirm(opportunity.id);
                      } else {
                        handleApply(opportunity.id);
                      }
                    }}
                    className={`mt-4 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                      ${opportunity.volunteers_registered >= opportunity.volunteers_needed 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : withdrawalConfirm === opportunity.id
                        ? 'bg-red-600 hover:bg-red-700'
                        : applicationStatuses[opportunity.id]
                        ? 'bg-green-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    disabled={opportunity.volunteers_registered >= opportunity.volunteers_needed}
                  >
                    {opportunity.volunteers_registered >= opportunity.volunteers_needed 
                      ? 'Opportunity Full'
                      : withdrawalConfirm === opportunity.id
                      ? 'Confirm Withdrawal'
                      : applicationStatuses[opportunity.id]
                      ? 'Applied'
                      : 'Apply Now'
                    }
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              variants={fadeInUp}
              className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contribution Chart</h2>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">GitHub-style contribution chart coming soon!</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="md:col-span-2 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Completed Tasks</h2>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {completedTasks.map((task) => (
                    <li key={task.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Clock className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Date: {task.date}</p>
                        </div>
                        <div className="inline-flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                          {task.hours} hours
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="md:col-span-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Volunteers Leaderboard</h2>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.map((entry) => (
                    <li key={entry.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Award className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Total Hours: {entry.hours}</p>
                        </div>
                        <div className="inline-flex items-center text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          Rank #{entry.rank || '-'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VolunteerDashboard;
