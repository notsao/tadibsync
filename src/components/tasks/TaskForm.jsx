import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components_/ui/dialog';
import { Label } from '@/components_/ui/label';
import { Input } from '@/components_/ui/input';
import { Textarea } from '@/components_/ui/textarea';
import { Button } from '@/components_/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components_/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from "@/components_/ui/popover";
import { Calendar } from "@/components_/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateTaskPoints } from '@/utils/storage';

const TaskForm = ({ isOpen, onClose, onSubmit, task, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'low',
    dueDate: new Date(),
    time: '12:00'
  });

  // Initialize form with task data when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        categoryId: task.categoryId || '',
        priority: task.priority || 'low',
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        time: task.dueDate ? format(new Date(task.dueDate), 'HH:mm') : '12:00'
      });
    } else {
      // Reset form when adding new task
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        priority: 'low',
        dueDate: new Date(),
        time: '12:00'
      });
    }
  }, [task]);

  // Calculate points based on category
  const [calculatedPoints, setCalculatedPoints] = useState(0);
  useEffect(() => {
    if (formData.categoryId) {
      const points = calculateTaskPoints({ categoryId: formData.categoryId });
      setCalculatedPoints(points);
    }
  }, [formData.categoryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const [hours, minutes] = formData.time.split(':').map(Number);
    const dueDate = new Date(formData.dueDate);
    dueDate.setHours(hours, minutes);

    const newTask = {
      title: formData.title,
      description: formData.description,
      categoryId: formData.categoryId,
      priority: formData.priority,
      points: calculatedPoints,
      dueDate: dueDate.toISOString(),
    };
    
    if (task) {
      newTask.id = task.id;
      newTask.status = task.status;
    }
    
    onSubmit(newTask);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {task ? 'update the' : 'create a new'} task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name} ({cat.basePoints} pts)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {formData.dueDate ? format(formData.dueDate, "MMM d, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                    initialFocus
                    className="rounded-md border shadow"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full pl-3 text-left font-normal"
                >
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span>{format(new Date(`2000-01-01T${formData.time}`), 'h:mm a')}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Points</Label>
            <div className="text-sm text-muted-foreground">
              This task will be worth {calculatedPoints} points based on its category.
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm; 