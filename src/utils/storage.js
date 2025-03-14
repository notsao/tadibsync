const fs = require('fs');
const path = require('path');

// Define paths for JSON files
const BASE_CATEGORIES_PATH = path.join(__dirname, 'base_categories.json');
const USERS_PATH = path.join(__dirname, 'users.json');

// Helper function to load JSON data
const loadJsonData = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Helper function to save JSON data
const saveJsonData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Load base categories
const loadBaseCategories = () => {
  return loadJsonData(BASE_CATEGORIES_PATH) || [];
};

// Load all users
const loadUsers = () => {
  return loadJsonData(USERS_PATH) || [];
};

// Save all users
const saveUsers = (users) => {
  saveJsonData(USERS_PATH, users);
};

// Find a user by userId
const findUser = (userId) => {
  const users = loadUsers();
  return users.find(user => user.userId === userId);
};

// Save a user's data
const saveUser = (user) => {
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.userId === user.userId);
  if (userIndex !== -1) {
    users[userIndex] = user; // Update existing user
  } else {
    users.push(user); // Add new user
  }
  saveUsers(users);
};

// Load tasks for a user
const loadTasks = (userId) => {
  const user = findUser(userId);
  return user ? user.tasks || [] : [];
};

// Save tasks for a user
const saveTasks = (userId, tasks) => {
  const user = findUser(userId);
  if (user) {
    user.tasks = tasks;
    saveUser(user);
  }
};

// Load categories for a user (base + custom)
const loadCategories = (userId) => {
  const baseCategories = loadBaseCategories();
  const user = findUser(userId);
  const customCategories = user ? user.categories || [] : [];
  return [...baseCategories, ...customCategories];
};

// Save custom categories for a user
const saveCategories = (userId, categories) => {
  const user = findUser(userId);
  if (user) {
    user.categories = categories;
    saveUser(user);
  }
};

// Load points history for a user
const loadPointsHistory = (userId) => {
  const user = findUser(userId);
  return user ? user.pointsHistory || [] : [];
};

// Save points history for a user
const savePointsHistory = (userId, history) => {
  const user = findUser(userId);
  if (user) {
    user.pointsHistory = history;
    saveUser(user);
  }
};

// Add points to a user's history
const addPointsToHistory = (userId, points, categoryId) => {
  const history = loadPointsHistory(userId);
  const today = new Date().toISOString().split('T')[0];

  const todayEntry = history.find(entry => entry.date === today);
  if (todayEntry) {
    todayEntry.points += points;
    todayEntry.tasks += 1;
  } else {
    history.push({ date: today, points, tasks: 1 });
  }

  // Keep only the last 30 days of history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredHistory = history.filter(entry => 
    new Date(entry.date) >= thirtyDaysAgo
  );

  savePointsHistory(userId, filteredHistory);
  return filteredHistory;
};

// Calculate task points based on category and priority
const calculateTaskPoints = (task) => {
  const categories = loadCategories(task.userId);
  const category = categories.find(c => c.id === task.categoryId);
  
  if (!category) return 0; // Default to 0 points if category is not found

  // Calculate points based on priority
  let points = category.basePoints;
  switch (task.priority) {
    case 'low':
      points *= 1;
      break;
    case 'medium':
      points *= 1.5;
      break;
    case 'high':
      points *= 2;
      break;
    default:
      points *= 1;
  }

  return Math.round(points); // Round to the nearest integer
};

// Calculate the user's streak
const calculateStreak = (userId) => {
  const tasks = loadTasks(userId);
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const hasCompletedTask = tasks.some(task => 
      task.status === 'completed' && 
      new Date(task.completedAt).toISOString().split('T')[0] === dateStr
    );

    if (!hasCompletedTask) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

// Get monthly stats for the user
const getMonthlyStats = (userId) => {
  const tasks = loadTasks(userId);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthTasks = tasks.filter(task => 
    task.status === 'completed' && 
    new Date(task.completedAt) >= startOfMonth
  );

  return {
    totalTasks: monthTasks.length,
    totalPoints: monthTasks.reduce((sum, task) => sum + task.points, 0)
  };
};

// Export all necessary functions
module.exports = {
  loadTasks,
  saveTasks,
  loadCategories,
  saveCategories,
  loadPointsHistory,
  savePointsHistory,
  addPointsToHistory,
  calculateTaskPoints,
  calculateStreak,
  getMonthlyStats,
};