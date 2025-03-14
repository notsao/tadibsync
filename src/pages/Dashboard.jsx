import { useState, useEffect } from "react";
import { Card } from "@/components_/ui/card";
import { Button } from "@/components_/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components_/ui/dialog";
import { Badge } from "@/components_/ui/badge";
import {
  Plus,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import {
  loadTasks,
  saveTasks,
  loadCategories,
  addPointsToHistory,
  calculateStreak,
  getMonthlyStats,
} from "@/utils/storage";
import { getPriorityColor } from "@/utils/styles";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Dashboard({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [streak, setStreak] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({ totalPoints: 0, totalTasks: 0 });

  // Load data for the user
  useEffect(() => {
    const loadData = () => {
      setTasks(loadTasks(userId));
      setCategories(loadCategories(userId));
      setStreak(calculateStreak(userId));
      setMonthlyStats(getMonthlyStats(userId));
    };

    loadData();
  }, [userId]);

  // Reload categories when the component is focused
  useEffect(() => {
    const handleFocus = () => {
      setCategories(loadCategories(userId));
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId]);

  // Add a new task
  const addTask = (newTask) => {
    const taskId = Math.max(...tasks.map(t => t.id || 0), 0) + 1;
    const taskWithId = { ...newTask, id: taskId, status: "in-progress" };
    const updatedTasks = [...tasks, taskWithId];
    setTasks(updatedTasks);
    saveTasks(userId, updatedTasks);
    setIsAddingTask(false);
    setEditingTask(null);
  };

  // Edit a task
  const editTask = (task) => {
    setEditingTask(task);
    setIsAddingTask(true);
  };

  // Update a task
  const updateTask = (updatedTask) => {
    const updatedTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    saveTasks(userId, updatedTasks);
    setIsAddingTask(false);
    setEditingTask(null);
  };

  // Complete a task
  const completeTask = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, status: "completed", completedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(userId, updatedTasks);

    const completedTask = updatedTasks.find(t => t.id === taskId);
    if (completedTask) {
      addPointsToHistory(userId, completedTask.points, completedTask.categoryId);
      setStreak(calculateStreak(userId));
      setMonthlyStats(getMonthlyStats(userId));
    }
  };

  // Delete a task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(userId, updatedTasks);
  };

  // Calculate category distribution for the pie chart
  const categoryData = categories.map(category => {
    const categoryTasks = tasks.filter(
      task => task.status === "completed" && task.categoryId === category.id
    );
    return {
      name: category.name,
      value: categoryTasks.reduce((sum, task) => sum + task.points, 0),
      color: category.color,
    };
  });

  // Calculate points history for the line chart
  const pointsHistory = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayTasks = tasks.filter(
      task =>
        task.status === "completed" &&
        new Date(task.completedAt).toDateString() === date.toDateString()
    );
    return {
      date: format(date, "EEE"),
      points: dayTasks.reduce((sum, task) => sum + task.points, 0),
      tasks: dayTasks.length,
    };
  }).reverse();

  // Calculate completion rate
  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100)
    : 0;

  // Get upcoming tasks
  const upcomingTasks = tasks
    .filter(task => task.status === "in-progress")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 enhanced-card">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <Trophy className="h-6 w-6 text-primary icon-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Total Points</p>
              <h3 className="text-2xl font-bold">{monthlyStats.totalPoints}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 enhanced-card">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-500/20 p-2">
              <Flame className="h-6 w-6 text-orange-500 icon-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Current Streak</p>
              <h3 className="text-2xl font-bold">{streak} days</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 enhanced-card">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-500/20 p-2">
              <Target className="h-6 w-6 text-green-500 icon-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Completion Rate</p>
              <h3 className="text-2xl font-bold">{completionRate}%</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 enhanced-card">
          <div className="flex items-center gap-2 h-full">
            <div className="rounded-full bg-primary/20 p-2">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <Button 
                variant="outline" 
                className="w-full btn-glow"
                onClick={() => setIsAddingTask(true)}
              >
                Add New Task
              </Button>
              <TaskForm
                isOpen={isAddingTask}
                onClose={() => setIsAddingTask(false)}
                onSubmit={editingTask ? updateTask : addTask}
                task={editingTask}
                categories={categories}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 enhanced-card">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Points History
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pointsHistory}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(252, 87%, 67%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(252, 87%, 67%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="date" className="chart-text" />
                <YAxis className="chart-text" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip">
                        <p className="font-semibold">{payload[0].payload.date}</p>
                        <p>{payload[0].value} points</p>
                        <p>{payload[0].payload.tasks} tasks</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="hsl(252, 87%, 67%)"
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 enhanced-card">
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Tasks by Category
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip">
                        <p className="font-semibold">{payload[0].name}</p>
                        <p>{payload[0].value} points</p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card className="p-4 enhanced-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Tasks
          </h3>
          <Button variant="outline" className="btn-glow" onClick={() => setIsAddingTask(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingTasks.map(task => {
            const category = categories.find(c => c.id === task.categoryId);
            return (
              <Card key={task.id} className="p-4 enhanced-card">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: category?.color }}
                      />
                      <h4 className="font-semibold">{task.title}</h4>
                    </div>
                    <Badge 
                      className="enhanced-badge"
                      style={{
                        background: `${category?.color}20`,
                        color: category?.color,
                        borderColor: `${category?.color}30`
                      }}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(task.dueDate), "PP")}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {task.points} pts
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Task List */}
      <Card className="p-4 enhanced-card">
        <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Your Tasks
        </h3>
        <TaskList
          tasks={tasks}
          onComplete={completeTask}
          onDelete={deleteTask}
          onEdit={editTask}
          categories={categories}
        />
      </Card>
    </div>
  );
}