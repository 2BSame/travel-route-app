import { BusSchedule } from "../types/busSchedule";

export const busSchedules: BusSchedule[] = [
  {
    id: 1,
    busNumber: "110",
    fromBusStopId: 3,
    toBusStopId: 2,
    departureTimes: ["09:00", "09:30", "10:00", "10:30", "11:00"],
    estimatedMinutes: 5
  },
  {
    id: 2,
    busNumber: "110",
    fromBusStopId: 2,
    toBusStopId: 1,
    departureTimes: ["09:10", "09:40", "10:10", "10:40", "11:10"],
    estimatedMinutes: 5
  },
  {
    id: 3,
    busNumber: "210",
    fromBusStopId: 1,
    toBusStopId: 2,
    departureTimes: ["09:05", "09:35", "10:05", "10:35", "11:05"],
    estimatedMinutes: 5
  },
  {
    id: 4,
    busNumber: "210",
    fromBusStopId: 2,
    toBusStopId: 3,
    departureTimes: ["09:15", "09:45", "10:15", "10:45", "11:15"],
    estimatedMinutes: 5
  }
];
