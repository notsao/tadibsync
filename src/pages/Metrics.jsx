import { useState, useEffect } from "react";
import { Card } from "@/components_/ui/card";
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
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import {
  calculateCategoryPoints,
  loadTasks,
  loadPointsHistory,
  calculateStreak,
  getMonthlyStats,
} from "@/utils/storage";
import { Trophy, Flame, Target, TrendingUp, BarChart3, Calendar, Clock, Star } from "lucide-react";

export default function Metrics() {
  const [categoryPoints, setCategoryPoints] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({ totalTasks: 0, totalPoints: 0 });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const loadedTasks = loadTasks();
      setCategoryPoints(calculateCategoryPoints());
      setPointsHistory(loadPointsHistory());
      setStreak(calculateStreak());
      setMonthlyStats(getMonthlyStats());
      setTasks(loadedTasks);
    };

    loadData();
  }, []);

  // Process data for the daily points chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, "EEE");
    const points = pointsHistory
      .filter(
        (p) =>
          format(new Date(p.date), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
      )
      .reduce((sum, p) => sum + p.points, 0);
    const tasksCompleted = tasks.filter(
      (t) =>
        t.status === "completed" &&
        format(new Date(t.completedAt), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    ).length;
    return { date: dateStr, points, tasksCompleted };
  }).reverse();

  // Process data for category distribution
  const categoryDistribution = categoryPoints.map((cat) => ({
    name: cat.name,
    value: cat.totalPoints,
    color: cat.color,
  }));

  // Calculate productivity score (0-100)
  const calculateProductivityScore = () => {
    const thisWeekStart = startOfWeek(new Date());
    const thisWeekEnd = endOfWeek(new Date());
    const thisWeekTasks = tasks.filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.completedAt) >= thisWeekStart &&
        new Date(t.completedAt) <= thisWeekEnd
    );
    
    const totalPossiblePoints = 100;
    const pointsEarned = thisWeekTasks.reduce((sum, t) => sum + t.points, 0);
    const tasksCompleted = thisWeekTasks.length;
    const streakBonus = Math.min(streak * 2, 20); // Max 20 points from streak
    
    return Math.min(
      Math.round((pointsEarned / 100 * 50) + (tasksCompleted * 2) + streakBonus),
      100
    );
  };

  // Calculate time of day distribution
  const getTimeDistribution = () => {
    const timeSlots = [
      { name: "Morning (6-12)", slot: [6, 12], value: 0 },
      { name: "Afternoon (12-17)", slot: [12, 17], value: 0 },
      { name: "Evening (17-22)", slot: [17, 22], value: 0 },
      { name: "Night (22-6)", slot: [22, 6], value: 0 },
    ];

    tasks.forEach((task) => {
      if (task.status === "completed" && task.completedAt) {
        const hour = new Date(task.completedAt).getHours();
        const slot = timeSlots.find(
          (s) =>
            (s.slot[0] <= s.slot[1]
              ? hour >= s.slot[0] && hour < s.slot[1]
              : hour >= s.slot[0] || hour < s.slot[1])
        );
        if (slot) slot.value++;
      }
    });

    return timeSlots;
  };

  // Calculate category performance metrics
  const categoryPerformance = categoryPoints.map((cat) => ({
    category: cat.name,
    points: cat.totalPoints,
    tasks: tasks.filter((t) => t.category === cat.name && t.status === "completed").length,
    efficiency: cat.totalPoints / Math.max(tasks.filter((t) => t.category === cat.name).length, 1),
  }));

  const productivityScore = calculateProductivityScore();
  const timeDistribution = getTimeDistribution();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 enhanced-card">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/20 p-2">
              <Trophy className="h-6 w-6 text-primary icon-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Productivity Score</p>
              <h3 className="text-2xl font-bold">{productivityScore}/100</h3>
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
              <p className="text-sm font-medium">Monthly Points</p>
              <h3 className="text-2xl font-bold">{monthlyStats.totalPoints}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 enhanced-card">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-500/20 p-2">
              <Calendar className="h-6 w-6 text-blue-500 icon-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Tasks Completed</p>
              <h3 className="text-2xl font-bold">{monthlyStats.totalTasks}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Points and Tasks Trend */}
        <Card className="p-6 enhanced-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Progress
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
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
                        <p>{payload[1].value} tasks completed</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                />
                <Area
                  type="monotone"
                  dataKey="tasksCompleted"
                  stroke="hsl(var(--secondary))"
                  fillOpacity={1}
                  fill="url(#colorTasks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 enhanced-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Points by Category
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip">
                        <p className="font-semibold">{payload[0].name}</p>
                        <p>{payload[0].value} points</p>
                        <p>{Math.round((payload[0].value / monthlyStats.totalPoints) * 100)}% of total</p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Time Distribution */}
        <Card className="p-6 enhanced-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Productivity Hours
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="name" className="chart-text" />
                <YAxis className="chart-text" />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip">
                        <p className="font-semibold">{payload[0].payload.name}</p>
                        <p>{payload[0].value} tasks completed</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar dataKey="value" fill="hsl(var(--primary))">
                  {timeDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(${266 + index * 30} 85% 58%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Performance Radar */}
        <Card className="p-6 enhanced-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Category Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryPerformance}>
                <PolarGrid className="chart-grid" />
                <PolarAngleAxis dataKey="category" className="chart-text" />
                <PolarRadiusAxis className="chart-text" />
                <Radar
                  name="Points"
                  dataKey="points"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="chart-tooltip">
                        <p className="font-semibold">{data.category}</p>
                        <p>{data.points} points</p>
                        <p>{data.tasks} tasks</p>
                        <p>{Math.round(data.efficiency * 100) / 100} points/task</p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
} 