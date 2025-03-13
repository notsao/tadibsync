import { loadCategories, loadTasks } from './storage';

const STORAGE_KEY = 'tadibsync_achievements';

// Achievement tiers
const TIERS = {
  BRONZE: { name: 'Bronze', threshold: 50, color: '#CD7F32' },
  SILVER: { name: 'Silver', threshold: 100, color: '#C0C0C0' },
  GOLD: { name: 'Gold', threshold: 200, color: '#FFD700' },
  PLATINUM: { name: 'Platinum', threshold: 500, color: '#E5E4E2' },
  DIAMOND: { name: 'Diamond', threshold: 1000, color: '#B9F2FF' }
};

// Category aliases for similar categories
const CATEGORY_ALIASES = {
  'Health': ['Health', 'Gym', 'Fitness', 'Exercise'],
  'Work': ['Work', 'Business', 'Office'],
  'Learning': ['Learning', 'Education', 'Study'],
  'Personal': ['Personal', 'Self-improvement']
};

// Calculate total points for each category from completed tasks
function calculateCategoryPoints() {
  const tasks = loadTasks();
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const categoryPoints = {};

  completedTasks.forEach(task => {
    if (!task.categoryId) return; // Skip tasks without categoryId
    categoryPoints[task.categoryId] = (categoryPoints[task.categoryId] || 0) + task.points;
  });

  return categoryPoints;
}

// Get achievements for a specific category
function getCategoryAchievements(categoryId) {
  const categories = loadCategories();
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];

  const categoryPoints = calculateCategoryPoints();
  const points = categoryPoints[categoryId] || 0;
  const achievements = [];

  Object.values(TIERS).forEach(tier => {
    const achieved = points >= tier.threshold;
    achievements.push({
      id: `${categoryId}_${tier.name.toLowerCase()}`,
      category: category.name,
      categoryId: category.id,
      tier: tier.name,
      threshold: tier.threshold,
      color: tier.color,
      currentPoints: points,
      progress: Math.min((points / tier.threshold) * 100, 100),
      achieved: achieved,
      earnedAt: achieved ? new Date().toISOString() : null
    });
  });

  return achievements;
}

// Save achievements to storage
function saveAchievements(achievements) {
  // Sort achievements by category and tier before saving
  const sortedAchievements = achievements.sort((a, b) => {
    if (a.categoryId !== b.categoryId) {
      return a.categoryId - b.categoryId;
    }
    return a.threshold - b.threshold;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedAchievements));
}

// Load all achievements
export function loadAchievements() {
  const stored = localStorage.getItem(STORAGE_KEY);
  let achievements = stored ? JSON.parse(stored) : [];
  
  // Recalculate current points and progress
  const categoryPoints = calculateCategoryPoints();
  const categories = loadCategories();
  
  // Ensure all categories have achievements
  categories.forEach(category => {
    const categoryAchievements = achievements.filter(a => a.categoryId === category.id);
    if (categoryAchievements.length === 0) {
      achievements.push(...getCategoryAchievements(category.id));
    }
  });
  
  // Update all achievements with current progress
  achievements = achievements.map(achievement => {
    const points = categoryPoints[achievement.categoryId] || 0;
    const achieved = points >= achievement.threshold;
    return {
      ...achievement,
      currentPoints: points,
      progress: Math.min((points / achievement.threshold) * 100, 100),
      achieved: achieved,
      earnedAt: achieved ? (achievement.earnedAt || new Date().toISOString()) : null
    };
  });
  
  saveAchievements(achievements);
  return achievements;
}

// Update achievements based on points
export function updateAchievements(categoryId) {
  let achievements = loadAchievements();
  const newAchievements = getCategoryAchievements(categoryId);
  
  // Update or add new achievements
  newAchievements.forEach(newAchievement => {
    const existingIndex = achievements.findIndex(a => a.id === newAchievement.id);
    if (existingIndex >= 0) {
      achievements[existingIndex] = {
        ...achievements[existingIndex],
        currentPoints: newAchievement.currentPoints,
        progress: newAchievement.progress,
        achieved: newAchievement.achieved,
        earnedAt: achievements[existingIndex].earnedAt || newAchievement.earnedAt
      };
    } else {
      achievements.push(newAchievement);
    }
  });
  
  saveAchievements(achievements);
  return achievements;
}

// Get achievement statistics
export function getAchievementStats() {
  const achievements = loadAchievements();
  const total = achievements.length;
  const earned = achievements.filter(a => a.achieved).length;
  const categories = [...new Set(achievements.map(a => a.categoryId))];
  
  const categoryStats = categories.map(categoryId => {
    const categoryAchievements = achievements.filter(a => a.categoryId === categoryId);
    return {
      categoryId,
      category: categoryAchievements[0]?.category,
      total: categoryAchievements.length,
      earned: categoryAchievements.filter(a => a.achieved).length,
      nextAchievement: categoryAchievements.find(a => !a.achieved)
    };
  });
  
  return {
    total,
    earned,
    percentage: total > 0 ? Math.round((earned / total) * 100) : 0,
    categoryStats
  };
}

// Initialize achievements for all categories
export function initializeAchievements() {
  const categories = loadCategories();
  const achievements = [];
  
  // Initialize achievements for each category
  categories.forEach(category => {
    achievements.push(...getCategoryAchievements(category.id));
  });
  
  saveAchievements(achievements);
  return achievements;
} 