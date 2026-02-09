"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { GlassWater, Bot, Droplet, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WaterProgressCircle } from "@/components/water-progress-circle";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_GOAL = 3000;

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentIntake, setCurrentIntake] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [customAmount, setCustomAmount] = useState("");
  const [goalMetToday, setGoalMetToday] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedIntake = localStorage.getItem("jalsa-hydration-intake");
      const storedGoal = localStorage.getItem("jalsa-hydration-goal");
      const storedDate = localStorage.getItem("jalsa-hydration-date");
      const storedGoalMet = localStorage.getItem("jalsa-hydration-goal-met");
      const today = new Date().toLocaleDateString();

      if (storedDate === today) {
        if (storedIntake) setCurrentIntake(JSON.parse(storedIntake));
        if (storedGoalMet) setGoalMetToday(JSON.parse(storedGoalMet));
      } else {
        localStorage.setItem("jalsa-hydration-intake", "0");
        setCurrentIntake(0);
        localStorage.setItem("jalsa-hydration-goal-met", "false");
        setGoalMetToday(false);
      }
      
      if (storedGoal) {
        const parsedGoal = JSON.parse(storedGoal);
        if(parsedGoal > 0) setGoal(parsedGoal);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const today = new Date().toLocaleDateString();
      localStorage.setItem("jalsa-hydration-intake", JSON.stringify(currentIntake));
      localStorage.setItem("jalsa-hydration-goal", JSON.stringify(goal));
      localStorage.setItem("jalsa-hydration-date", today);
      localStorage.setItem("jalsa-hydration-goal-met", JSON.stringify(goalMetToday));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, [currentIntake, goal, goalMetToday, isMounted]);


  useEffect(() => {
    if(isMounted && currentIntake >= goal && goal > 0 && !goalMetToday) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        zIndex: 1000,
      });
      toast({
        title: "Goal Reached! 🎉",
        description: "Congratulations! You've met your hydration goal for today.",
      });
      setGoalMetToday(true);
    }
  }, [currentIntake, goal, goalMetToday, isMounted, toast]);

  const addWater = (amount: number) => {
    if (amount <= 0) return;
    setCurrentIntake((prev) => prev + amount);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      addWater(amount);
      setCustomAmount("");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a positive number.",
      });
    }
  };

  const resetIntake = () => {
    setCurrentIntake(0);
    setGoalMetToday(false);
    toast({
      title: "Intake Reset",
      description: "Your water intake for today has been reset to 0.",
    });
  };

  if (!isMounted) {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <div className="w-full max-w-md h-[700px] bg-card rounded-lg shadow-lg animate-pulse"></div>
        </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Droplet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Jalsa Hydration</CardTitle>
          <CardDescription>Your daily water intake tracker</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-2">
          <WaterProgressCircle current={currentIntake} goal={goal} />
          
          <div className="w-full space-y-3">
            <p className="text-center text-sm font-medium text-muted-foreground">Quick Add</p>
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" variant="outline" onClick={() => addWater(250)}>
                <GlassWater className="mr-2 h-5 w-5" /> Glass (250ml)
              </Button>
              <Button size="lg" variant="outline" onClick={() => addWater(500)}>
                <Bot className="mr-2 h-5 w-5" /> Bottle (500ml)
              </Button>
            </div>
          </div>

          <form onSubmit={handleCustomAdd} className="flex w-full items-center gap-2">
            <Input
              type="number"
              placeholder="Custom amount in ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="w-full text-center">
            <label htmlFor="goal" className="mb-1 block text-sm font-medium text-muted-foreground">Daily Goal</label>
            <div className="relative mx-auto w-48">
              <Input
                id="goal"
                type="number"
                value={goal}
                onChange={(e) => {
                  const newGoal = parseInt(e.target.value, 10);
                  if (e.target.value === '') {
                      setGoal(0);
                  } else if (!isNaN(newGoal) && newGoal > 0) {
                    setGoal(newGoal);
                  }
                }}
                className="pr-12 text-center text-lg font-semibold"
                min="1"
                step="100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">ml</span>
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Button variant="ghost" className="text-muted-foreground" onClick={resetIntake}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset for Today
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
