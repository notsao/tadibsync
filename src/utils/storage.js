const STORAGE_KEYS = {
  TASKS: 'tadibsync_tasks',
  CATEGORIES: 'tadibsync_categories',
  POINTS_HISTORY: 'tadibsync_points_history'
};

const defaultCategories = [
  { 
    id: 1, 
    name: 'Health', 
    basePoints: 20, 
    color: '#22c55e',
    icon: 'Heart'
  },
  { 
    id: 2, 
    name: 'Work', 
    basePoints: 18, 
    color: '#6366f1',
    icon: 'Briefcase'
  },
  { 
    id: 3, 
    name: 'Learning', 
    basePoints: 15, 
    color: '#3b82f6',
    icon: 'GraduationCap'
  },
  { 
    id: 4, 
    name: 'Fitness', 
    basePoints: 15, 
    color: '#ec4899',
    icon: 'Dumbbell'
  },
  { 
    id: 5, 
    name: 'Personal', 
    basePoints: 12, 
    color: '#f59e0b',
    icon: 'Brain'
  },
  { 
    id: 6, 
    name: 'Social', 
    basePoints: 10, 
    color: '#8b5cf6',
    icon: 'Users'
  },
  { 
    id: 7, 
    name: 'Hobbies', 
    basePoints: 8, 
    color: '#06b6d4',
    icon: 'Palette'
  }
];

export function loadTasks() {
  const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  return tasks ? JSON.parse(tasks) : [];
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export const loadCategories = () => {
  const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!categories) {
    // Initialize with default categories if none exist
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    return defaultCategories;
  }
  
  const savedCategories = JSON.parse(categories);
  
  // Ensure all required fields are present and up to date
  const updatedCategories = savedCategories.map(category => ({
    id: category.id,
    name: category.name,
    basePoints: category.basePoints || defaultCategories.find(c => c.name === category.name)?.basePoints || 1,
    color: category.color || defaultCategories.find(c => c.name === category.name)?.color || '#94a3b8',
    icon: category.icon || defaultCategories.find(c => c.name === category.name)?.icon || 'Tag'
  }));

  // Save the updated categories back to storage
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
  return updatedCategories;
};

export const saveCategories = (categories) => {
  // Ensure each category has all required fields and a unique ID
  const categoriesWithIds = categories.map((cat, index) => ({
    id: cat.id || index + 1,
    name: cat.name,
    basePoints: cat.basePoints || 1,
    color: cat.color || '#94a3b8',
    icon: cat.icon || 'Tag'
  }));

  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesWithIds));
  
  // After saving categories, update any existing tasks with the new category information
  const tasks = loadTasks();
  const updatedTasks = tasks.map(task => {
    const category = categoriesWithIds.find(c => c.id === task.categoryId);
    if (category) {
      return {
        ...task,
        points: calculateTaskPoints({ ...task, categoryId: category.id })
      };
    }
    return task;
  });
  
  saveTasks(updatedTasks);
};

export function loadPointsHistory() {
  const history = localStorage.getItem(STORAGE_KEYS.POINTS_HISTORY);
  return history ? JSON.parse(history) : [];
}

export function savePointsHistory(history) {
  localStorage.setItem(STORAGE_KEYS.POINTS_HISTORY, JSON.stringify(history));
}

export function addPointsToHistory(points, category) {
  const history = loadPointsHistory();
  const today = new Date().toISOString().split('T')[0];
  
  const todayEntry = history.find(entry => entry.date === today);
  if (todayEntry) {
    todayEntry.points += points;
    todayEntry.tasks += 1;
  } else {
    history.push({ date: today, points, tasks: 1 });
  }
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredHistory = history.filter(entry => 
    new Date(entry.date) >= thirtyDaysAgo
  );
  
  localStorage.setItem(STORAGE_KEYS.POINTS_HISTORY, JSON.stringify(filteredHistory));
  
  // Update achievements for the category
  const { updateAchievements } = require('./achievements');
  updateAchievements(category);
  
  return filteredHistory;
}

export function calculateCategoryPoints() {
  const tasks = loadTasks();
  const categories = loadCategories();
  
  return categories.map(category => {
    const categoryTasks = tasks.filter(task => 
      task.categoryId === category.id
    );
    const totalPoints = categoryTasks.reduce((sum, task) => sum + task.points, 0);
    
    return {
      ...category,
      totalPoints
    };
  });
}

export function calculateStreak() {
  const tasks = loadTasks();
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
}

export function getMonthlyStats() {
  const tasks = loadTasks();
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
}

export const calculateTaskPoints = (task) => {
  const categories = loadCategories();
  const category = categories.find(c => c.id === task.categoryId);
  
  // Return base points directly without multipliers
  return category ? category.basePoints : 1;
}; 