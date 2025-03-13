import { Button } from "@/components_/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const features = [
    "Track tasks and earn points",
    "Visualize your progress with beautiful charts",
    "Set goals and maintain streaks",
    "Categorize and prioritize tasks",
    "Monitor your productivity trends",
    "Dark mode for comfortable viewing",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Transform Your Productivity
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              TadibSync helps you track tasks, earn points, and visualize your progress
              with beautiful metrics and insights.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Everything you need to stay productive
            </h2>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-effect rounded-lg p-8">
            {/* Placeholder for feature preview/screenshot */}
            <div className="aspect-video rounded-lg bg-card"></div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to boost your productivity?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who have transformed their task management with
            TadibSync.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              Start Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 