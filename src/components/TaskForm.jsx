import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components_/ui/dialog';
import { Label } from '@/components_/ui/label';
import { Input } from '@/components_/ui/input';
import { Textarea } from '@/components_/ui/textarea';
import { Button } from '@/components_/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components_/ui/select';
import { loadCategories, calculateTaskPoints } from '@/utils/storage';

const TaskForm = ({ isOpen, onClose, onSubmit, task }) => {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description : '');
  const [category, setCategory] = useState(task ? task.category : '');
  const [priority, setPriority] = useState(task ? task.priority : 'low');
  const [dueDate, setDueDate] = useState(task ? task.dueDate : '');
  const [categories, setCategories] = useState([]);
  const [calculatedPoints, setCalculatedPoints] = useState(0);

  useEffect(() => {
    setCategories(loadCategories());
  }, []);

  useEffect(() => {
    if (category && priority) {
      const points = calculateTaskPoints({ category, priority });
      setCalculatedPoints(points);
    }
  }, [category, priority]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = {
      title,
      description,
      category,
      priority,
      points: calculatedPoints,
      dueDate,
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
      <DialogContent className="task-form-dialog">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {task ? 'update' : 'create'} your task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div className="form-group">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
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
                value={priority}
                onValueChange={setPriority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (x1)</SelectItem>
                  <SelectItem value="medium">Medium (x1.5)</SelectItem>
                  <SelectItem value="high">High (x2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <Label>Points</Label>
              <div className="text-lg font-semibold text-primary">
                {calculatedPoints} points
              </div>
              <p className="text-sm text-muted-foreground">
                Based on category and priority
              </p>
            </div>
            <div className="form-group">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm; 