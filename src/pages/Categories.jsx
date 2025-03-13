import React, { useState, useEffect } from 'react';
import { Card } from "@/components_/ui/card";
import { Button } from "@/components_/ui/button";
import { Input } from "@/components_/ui/input";
import { Label } from "@/components_/ui/label";
import { Badge } from "@/components_/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components_/ui/dialog";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tags,
  AlertCircle,
  Star,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Heart,
  Brain,
  Users,
  Palette,
  Code,
  BookOpen,
  Music,
  Coffee,
  Home,
  Plane,
  ShoppingCart,
  Gamepad
} from "lucide-react";
import { loadCategories, saveCategories } from "@/utils/storage";
import { cn } from "@/lib/utils";

// Preset category icons with labels
const categoryIcons = [
  { icon: Star, label: 'Star' },
  { icon: Dumbbell, label: 'Fitness' },
  { icon: Briefcase, label: 'Work' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Heart, label: 'Health' },
  { icon: Brain, label: 'Personal Growth' },
  { icon: Users, label: 'Social' },
  { icon: Palette, label: 'Art' },
  { icon: Code, label: 'Programming' },
  { icon: BookOpen, label: 'Reading' },
  { icon: Music, label: 'Music' },
  { icon: Coffee, label: 'Lifestyle' },
  { icon: Home, label: 'Home' },
  { icon: Plane, label: 'Travel' },
  { icon: ShoppingCart, label: 'Shopping' },
  { icon: Gamepad, label: 'Gaming' }
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    color: '#6366f1', 
    basePoints: 10,
    icon: 'Star'
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setCategories(loadCategories());
  }, []);

  const handleSaveCategory = (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id ? { ...newCategory, id: editingCategory.id } : cat
      );
      setCategories(updatedCategories);
      saveCategories(updatedCategories);
    } else {
      // Add new category
      const maxId = Math.max(...categories.map(c => c.id || 0), 0);
      const categoryWithId = { ...newCategory, id: maxId + 1 };
      const updatedCategories = [...categories, categoryWithId];
      setCategories(updatedCategories);
      saveCategories(updatedCategories);
    }

    // Reset form and close dialog
    setNewCategory({ name: '', color: '#6366f1', basePoints: 10, icon: 'Star' });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ ...category });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
  };

  // Get the icon component by name
  const getIconByName = (iconName) => {
    const iconObj = categoryIcons.find(i => i.label === iconName);
    return iconObj?.icon || Star;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Tags className="h-8 w-8" />
            Categories
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage your task categories, point values, and appearance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', color: '#6366f1', basePoints: 10, icon: 'Star' });
            }}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="basePoints">Base Points</Label>
                  <Input
                    id="basePoints"
                    type="number"
                    min="1"
                    value={newCategory.basePoints}
                    onChange={(e) => setNewCategory({ ...newCategory, basePoints: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="h-12 w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {categoryIcons.map(({ icon: Icon, label }) => (
                      <Button
                        key={label}
                        type="button"
                        variant={newCategory.icon === label ? "default" : "outline"}
                        className={cn(
                          "h-12 aspect-square p-0 flex items-center justify-center",
                          newCategory.icon === label && "ring-2 ring-primary"
                        )}
                        onClick={() => setNewCategory({ ...newCategory, icon: label })}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const IconComponent = getIconByName(category.icon);
          return (
            <Card key={category.id} className="p-6 enhanced-card group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="rounded-full p-2 w-12 h-12 flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <IconComponent 
                      className="h-6 w-6" 
                      style={{ color: category.color }} 
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {category.basePoints} base points
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCategory(category)}
                    className="hover:bg-accent"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {categories.length === 0 && (
          <Card className="p-6 enhanced-card border-dashed">
            <div className="flex flex-col items-center justify-center text-center space-y-3 py-6">
              <div className="rounded-full bg-primary/20 p-3">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">No categories yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first category to start organizing your tasks
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 