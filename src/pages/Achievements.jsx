import { useEffect, useState } from 'react';
import { Card } from "@/components_/ui/card";
import { Progress } from "@/components_/ui/progress";
import { Medal, ChevronUp, ChevronDown, Star } from "lucide-react";
import { loadAchievements, getAchievementStats, initializeAchievements } from '@/utils/achievements';
import { Button } from '@/components_/ui/button';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, earned: 0, percentage: 0, categoryStats: [] });
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const loadedAchievements = loadAchievements();
    if (loadedAchievements.length === 0) {
      initializeAchievements();
    }
    setAchievements(loadAchievements());
    setStats(getAchievementStats());
  }, []);

  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getNextMilestone = (achievements) => {
    const sortedAchievements = [...achievements].sort((a, b) => a.threshold - b.threshold);
    return sortedAchievements.find(a => !a.achieved) || sortedAchievements[sortedAchievements.length - 1];
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <Card className="p-6 bg-background/95 border-border/50 glass-bg">
        <h2 className="text-xl font-semibold mb-4">Progress Overview</h2>
        <div className="grid gap-4">
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
            const earnedCount = categoryAchievements.filter(a => a.achieved).length;
            const totalCount = categoryAchievements.length;
            const percentage = Math.round((earnedCount / totalCount) * 100);
            const currentPoints = categoryAchievements[0]?.currentPoints || 0;
            const maxThreshold = Math.max(...categoryAchievements.map(a => a.threshold));
            
            return (
              <div key={category} className="group relative">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Medal className="h-4 w-4" style={{ color: categoryAchievements[0]?.color }} />
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {earnedCount} of {totalCount}
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-8">
                  <Progress 
                    value={(currentPoints / maxThreshold) * 100}
                    className="absolute inset-0 rounded-md overflow-hidden progress-enhanced"
                    style={{
                      '--primary': categoryAchievements[0]?.color,
                      '--primary-foreground': 'white'
                    }}
                  />
                  {/* Hover Card */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-background/95 shadow-lg rounded-lg p-2 border border-border text-center min-w-[100px]">
                      <div className="text-xs font-medium" style={{ color: categoryAchievements[0]?.color }}>
                        {currentPoints} points
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {percentage}% Complete
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Progress */}
      <div className="grid gap-6">
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
          const earnedCount = categoryAchievements.filter(a => a.achieved).length;
          const totalCount = categoryAchievements.length;
          const percentage = Math.round((earnedCount / totalCount) * 100);
          const isExpanded = expandedCategories[category];
          const currentPoints = categoryAchievements[0]?.currentPoints || 0;
          const nextMilestone = getNextMilestone(categoryAchievements);
          const maxThreshold = Math.max(...categoryAchievements.map(a => a.threshold));
          
          return (
            <Card 
              key={category} 
              className={`enhanced-card hover-glow overflow-hidden`}
              style={{
                '--category-color': categoryAchievements[0]?.color,
                background: `linear-gradient(135deg, 
                  ${categoryAchievements[0]?.color}10,
                  ${categoryAchievements[0]?.color}05
                )`,
                borderColor: `${categoryAchievements[0]?.color}20`
              }}
            >
              <Button
                variant="ghost"
                className="w-full p-6 flex items-center justify-between hover:bg-background/40"
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center gap-4">
                  <Medal className="h-5 w-5" style={{ color: categoryAchievements[0]?.color }} />
                  <div>
                    <h3 className="text-xl font-semibold">{category}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {currentPoints} points
                      </p>
                      {nextMilestone && !nextMilestone.achieved && (
                        <p className="text-sm text-muted-foreground">
                          • {nextMilestone.threshold - currentPoints} points until {nextMilestone.tier}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{earnedCount} of {totalCount}</p>
                    <p className="text-xs text-muted-foreground">achievements</p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </Button>

              {/* Category Details */}
              {isExpanded && (
                <div className="p-6 pt-2 space-y-6">
                  {/* Points Progress Visualization */}
                  <div className="space-y-6">
                    {/* Main Progress Bar */}
                    <div className="relative pt-6 pb-12">
                      <Progress 
                        value={(currentPoints / maxThreshold) * 100}
                        className="h-3 rounded-full overflow-hidden progress-enhanced"
                        style={{
                          '--primary': categoryAchievements[0]?.color,
                          '--primary-foreground': 'white'
                        }}
                      />

                      {/* Current Points Display */}
                      <div className="absolute -top-1 transform -translate-x-1/2"
                           style={{
                             left: `${(currentPoints / maxThreshold) * 100}%`,
                           }}>
                        <div 
                          className="bg-background shadow-md border-2 rounded-md px-2 py-0.5 text-xs font-medium"
                          style={{ 
                            borderColor: categoryAchievements[0]?.color,
                            color: categoryAchievements[0]?.color
                          }}>
                          {currentPoints}
                        </div>
                      </div>

                      {/* Milestone Markers */}
                      <div className="absolute w-full -bottom-8">
                        {categoryAchievements
                          .sort((a, b) => a.threshold - b.threshold)
                          .map((achievement) => (
                            <div
                              key={achievement.id}
                              className="absolute transform -translate-x-1/2 group/milestone"
                              style={{
                                left: `${(achievement.threshold / maxThreshold) * 100}%`,
                              }}
                            >
                              <div 
                                className={`
                                  w-4 h-4 rounded-full border-2
                                  flex items-center justify-center
                                  transition-all duration-200
                                  hover:scale-110
                                  cursor-pointer
                                  relative
                                `}
                                style={{ 
                                  background: achievement.achieved ? achievement.color : 'transparent',
                                  borderColor: achievement.color,
                                }}
                              >
                                <Star 
                                  className="w-2 h-2" 
                                  style={{ 
                                    color: achievement.achieved ? 'white' : achievement.color
                                  }}
                                />
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/milestone:opacity-100 transition-opacity z-50 pointer-events-none">
                                  <div className="bg-background/95 shadow-lg rounded-md px-3 py-2 text-xs border border-border">
                                    <div className="font-medium" style={{ color: achievement.color }}>
                                      {achievement.tier} {achievement.category}
                                    </div>
                                    <div className="text-muted-foreground">
                                      Earn {achievement.threshold} points in {achievement.category} tasks
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Achievement List */}
                    <div className="space-y-4 mt-12">
                      {categoryAchievements
                        .sort((a, b) => a.threshold - b.threshold)
                        .map((achievement) => (
                          <div key={achievement.id} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`
                                  w-5 h-5 rounded-full border-2
                                  flex items-center justify-center
                                  ${achievement.achieved ? 'bg-current' : 'bg-background'}
                                `}
                                style={{ borderColor: achievement.color, color: achievement.color }}>
                                  <Star className="w-3 h-3" style={{ color: achievement.achieved ? 'white' : achievement.color }} />
                                </div>
                                <div>
                                  <h4 className="font-medium flex items-center gap-2">
                                    {achievement.tier} {achievement.category}
                                    <span className="text-sm text-muted-foreground">
                                      {achievement.currentPoints} / {achievement.threshold} points
                                    </span>
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Earn {achievement.threshold} points in {achievement.category} tasks
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Progress 
                              value={(achievement.currentPoints / achievement.threshold) * 100}
                              className="h-1.5 rounded-full overflow-hidden progress-enhanced"
                              style={{
                                '--primary': achievement.color,
                                '--primary-foreground': 'white'
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}