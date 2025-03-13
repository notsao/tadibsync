import { useState } from 'react';
import { Card } from "@/components_/ui/card";
import { Button } from "@/components_/ui/button";
import { Settings2 } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-3">
        <Settings2 className="h-8 w-8" />
        Settings
      </h2>

      <div className="grid gap-6">
        {/* Add other settings sections here */}
      </div>
    </div>
  );
} 