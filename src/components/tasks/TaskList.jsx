import React from "react";
import { Badge } from "@/components_/ui/badge";
import { Button } from "@/components_/ui/button";
import { Card } from "@/components_/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_/ui/tabs";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  Star,
  List,
  LayoutGrid,
  AlertCircle,
  Calendar,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  Dumbbell, // Health/Fitness
  Briefcase, // Work
  User, // Personal
  GraduationCap, // Learning
  Code, // Programming
  Palette, // Creative
  Heart, // Wellness
  ShoppingCart, // Shopping
  Home, // Home
  Book, // Reading
  Music, // Entertainment
  Plane, // Travel
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components_/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { loadCategories } from "@/utils/storage";

// Category icon mapping with common variations
const categoryIcons = {
  health: Dumbbell,
  fitness: Dumbbell,
  gym: Dumbbell,
  exercise: Dumbbell,
  work: Briefcase,
  business: Briefcase,
  office: Briefcase,
  personal: User,
  learning: GraduationCap,
  education: GraduationCap,
  study: GraduationCap,
  programming: Code,
  coding: Code,
  development: Code,
  creative: Palette,
  art: Palette,
  design: Palette,
  wellness: Heart,
  health: Heart,
  medical: Heart,
  shopping: ShoppingCart,
  purchase: ShoppingCart,
  buy: ShoppingCart,
  home: Home,
  house: Home,
  household: Home,
  reading: Book,
  books: Book,
  literature: Book,
  entertainment: Music,
  fun: Music,
  leisure: Music,
  travel: Plane,
  trip: Plane,
  vacation: Plane
};

const getIconForCategory = (categoryName) => {
  const normalizedName = categoryName.toLowerCase();
  return categoryIcons[normalizedName] || Tag;
};

export default function TaskList({ tasks, onComplete, onDelete, onEdit, categories }) {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("dueDate");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filterTasks = (status) => {
    return tasks
      .filter((task) => {
        if (status !== "all" && task.status !== status) return false;
        if (filterPriority !== "all" && task.priority !== filterPriority) return false;
        if (filterCategory !== "all" && task.categoryId !== filterCategory) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "dueDate":
            return new Date(a.dueDate) - new Date(b.dueDate);
          case "priority":
            return b.points - a.points;
          case "title":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return { bg: "#ef444420", color: "#ef4444", border: "#ef444430" }; // Red
      case "medium":
        return { bg: "#f59e0b20", color: "#f59e0b", border: "#f59e0b30" }; // Amber
      case "low":
        return { bg: "#22c55e20", color: "#22c55e", border: "#22c55e30" }; // Green
      default:
        return { bg: "#94a3b820", color: "#94a3b8", border: "#94a3b830" }; // Gray
    }
  };

  const TaskCard = ({ task }) => {
    const category = categories.find(c => c.id === task.categoryId);
    const priorityColors = getPriorityColor(task.priority);
    const IconComponent = category?.icon ? getIconForCategory(category.name) : Tag;
    
    return (
      <Card className="p-4 enhanced-card">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-shrink-0">
                <IconComponent 
                  className="h-4 w-4" 
                  style={{ color: category?.color }}
                />
                <h3 className="font-semibold text-lg">{task.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  className="enhanced-badge"
                  style={{
                    background: category?.color ? `${category.color}20` : '#94a3b820',
                    color: category?.color || '#94a3b8',
                    borderColor: category?.color ? `${category.color}30` : '#94a3b830'
                  }}
                >
                  {category?.name || 'Uncategorized'}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(task.dueDate), "PP")}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {task.points} points
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="btn-glow">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== "completed" && (
                <DropdownMenuItem onClick={() => onComplete(task.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  };

  const TaskTable = ({ tasks }) => (
    <div className="rounded-md border">
      <table className="table-custom">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Points</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const category = categories.find(c => c.id === task.categoryId);
            const priorityColors = getPriorityColor(task.priority);
            const IconComponent = category?.icon ? getIconForCategory(category.name) : Tag;
            
            return (
              <tr key={task.id}>
                <td className="font-medium">
                  <div className="flex items-center gap-2">
                    <IconComponent 
                      className="h-4 w-4" 
                      style={{ color: category?.color }}
                    />
                    {task.title}
                  </div>
                </td>
                <td>
                  <Badge 
                    className="enhanced-badge"
                    style={{
                      background: category?.color ? `${category.color}20` : '#94a3b820',
                      color: category?.color || '#94a3b8',
                      borderColor: category?.color ? `${category.color}30` : '#94a3b830'
                    }}
                  >
                    {category?.name || 'Uncategorized'}
                  </Badge>
                </td>
                <td>
                  <Badge 
                    className="enhanced-badge"
                    style={{
                      background: priorityColors.bg,
                      color: priorityColors.color,
                      borderColor: priorityColors.border
                    }}
                  >
                    {task.priority}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(task.dueDate), "PP")}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {task.points}
                  </div>
                </td>
                <td>
                  <Badge
                    className="enhanced-badge"
                    style={{
                      background: task.status === "completed" ? "#22c55e20" : `${category?.color}20`,
                      color: task.status === "completed" ? "#22c55e" : category?.color,
                      borderColor: task.status === "completed" ? "#22c55e30" : `${category?.color}30`
                    }}
                  >
                    {task.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    {task.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="btn-glow"
                        onClick={() => onComplete(task.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="btn-glow"
                      onClick={() => onEdit(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="btn-glow"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            className="btn-glow"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            className="btn-glow"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="btn-glow">
                <Filter className="mr-2 h-4 w-4" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterPriority("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="btn-glow">
                <Tag className="mr-2 h-4 w-4" />
                Category
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterCategory("all")}>
                All Categories
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category.id} 
                  onClick={() => setFilterCategory(category.id)}
                >
                  {React.createElement(getIconForCategory(category.name), {
                    className: "mr-2 h-4 w-4",
                    style: { color: category.color }
                  })}
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="btn-glow">
                <Tag className="mr-2 h-4 w-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("dueDate")}>
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")}>
                Title
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="in-progress">
            <Clock className="mr-2 h-4 w-4" />
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="all">
            <List className="mr-2 h-4 w-4" />
            All Tasks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="in-progress" className="space-y-4">
          {viewMode === "grid" ? (
            filterTasks("in-progress").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <TaskTable tasks={filterTasks("in-progress")} />
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {viewMode === "grid" ? (
            filterTasks("completed").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <TaskTable tasks={filterTasks("completed")} />
          )}
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          {viewMode === "grid" ? (
            filterTasks("all").map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <TaskTable tasks={filterTasks("all")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 