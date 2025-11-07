
import { 
  Dumbbell, 
  Book, 
  Leaf,
  Home,
  Activity as ActivityIcon,
  Coffee,
  GlassWater,
  LucideIcon
} from "lucide-react";
import { Activity } from '@/types';

export const activityInfo: Record<string, string> = {
  "Mindfulness 20 min": "Mindfulness kan exempelvis vara att läsa bok, lösa soduko, meditera eller annat liknande, denna aktivitet ska vara helt SKÄRMFRI.",
  "Vegetarisk dag": "Ät inga kött- eller fiskprodukter under hela dagen.",
  "Frukt/grönt till 3 måltider": "Se till att inkludera frukt eller grönsaker i minst tre måltider under dagen.",
  "Inget koffein hela dagen": "Undvik kaffe, te, energidrycker och andra koffeinhaltiga drycker.",
  "Hemmaträning 20 min": "Genomför ett träningspass hemma som varar i minst 20 minuter.",
  "Gym 30 min": "Besök gymmet och träna i minst 30 minuter.",
  "Dricka 1.5L vatten": "Drick minst 1,5 liter vatten under dagen.",
  "20K steg": "Ta minst 20 000 steg under dagen.",
  "15K steg": "Ta minst 15 000 steg under dagen.",
  "10K steg": "Ta minst 10 000 steg under dagen.",
  "5K steg": "Ta minst 5 000 steg under dagen."
};

export const getActivityCategory = (activityName: string): 'physical' | 'diet' | 'mind' => {
  if (activityName.includes("Gym") || activityName.includes("steg") || activityName.includes("Hemmaträning")) {
    return 'physical';
  }
  if (activityName.includes("Vegetarisk") || activityName.includes("Frukt") || 
      activityName.includes("vatten") || activityName.includes("koffein") || 
      activityName.includes("socker")) {
    return 'diet';
  }
  return 'mind'; // Default to mind
};

export const getActivityIcon = (activityName: string): LucideIcon => {
  if (activityName.includes("Gym")) return Dumbbell;
  if (activityName.includes("steg")) return ActivityIcon;
  if (activityName.includes("Mindfulness") || activityName.includes("bok")) return Book;
  if (activityName.includes("Vegetarisk")) return Leaf;
  if (activityName.includes("Frukt")) return Leaf;
  if (activityName.includes("Hemmaträning")) return Home;
  if (activityName.includes("vatten")) return GlassWater;
  if (activityName.includes("koffein")) return Coffee;
  return ActivityIcon; // Default icon
};

export const getActivityDuration = (activityName: string): string => {
  if (activityName.includes("20 min")) return "20 min";
  if (activityName.includes("30 min")) return "30 min";
  if (activityName.includes("1.5L")) return "1.5 Liter";
  if (activityName.includes("20K")) return "20 000 steg";
  if (activityName.includes("15K")) return "15 000 steg";
  if (activityName.includes("10K")) return "10 000 steg";
  if (activityName.includes("5K")) return "5 000 steg";
  if (activityName.includes("3 måltider")) return "3 måltider";
  if (activityName.includes("dag")) return "Hela dagen";
  return "";
};

export const getActivityTitle = (activityName: string): string => {
  if (activityName.includes("Mindfulness")) return "Mindfulness";
  if (activityName.includes("Vegetarisk")) return "Vegetarisk kost";
  if (activityName.includes("Frukt/grönt")) return "Frukt/grönt";
  if (activityName.includes("koffein")) return "Utan koffein";
  if (activityName.includes("socker")) return "Utan socker";
  if (activityName.includes("Hemmaträning")) return "Hemmaträning";
  if (activityName.includes("Gym")) return "Gym";
  if (activityName.includes("Dricka")) return "Dricka vatten";
  if (activityName.includes("steg")) return "Steg";
  return activityName;
};

export const getCategoryTitle = (category: string): string => {
  switch(category) {
    case 'physical': return 'Fysiska aktiviteter';
    case 'diet': return 'Kost och dryck';
    case 'mind': return 'Sinnet';
    default: return 'Övriga aktiviteter';
  }
};

export const groupActivitiesByCategory = (activities: Activity[]): {[key: string]: Activity[]} => {
  const grouped: {[key: string]: Activity[]} = {
    'physical': [],
    'diet': [],
    'mind': []
  };

  activities.forEach(activity => {
    // Ensure activity has a category, use getActivityCategory as a fallback
    const category = activity.category || getActivityCategory(activity.name);
    
    if (grouped[category]) {
      grouped[category].push(activity);
    } else {
      // If for some reason the category doesn't match our predefined ones,
      // default to 'mind'
      grouped['mind'].push(activity);
    }
  });

  return grouped;
};
