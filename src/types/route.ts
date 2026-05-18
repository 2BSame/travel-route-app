import { SelectedBus } from "./busSchedule";
import { Place } from "./place";

export interface ScoredPlace extends Place {
  score: number;
  reasons: string[];
}

export interface RoutePath {
  from: number;
  to: number;
  path: number[];
  distance: number;
  walkTime: number;
  bus: SelectedBus | null; 
}

export interface TimeSummary {
  totalTime: number;
  walkingTime: number;
  stayTime: number;
  busTime: number;
  busWaitTime: number;
}

export interface FinalRoute {
  routeTitle: string;
  summary: string;
  startBus: SelectedBus | null;
  returnBus: SelectedBus | null;
  places: ScoredPlace[];
  paths: RoutePath[];
  timeSummary: TimeSummary;
  warnings: string[];
}