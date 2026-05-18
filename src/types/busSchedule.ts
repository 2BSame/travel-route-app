export interface BusSchedule {
  id: number;
  busNumber: string;
  fromBusStopId: number; // busStops.ts의 id
  toBusStopId: number;   // busStops.ts의 id
  departureTimes: string[];
  estimatedMinutes: number; // 이동 소요 시간
}

export interface SelectedBus {
  busNumber: string;
  fromBusStopId: number;
  toBusStopId: number;
  departureTime: string;
  waitTime: number;
  rideTime: number;
  arrivalTime: string;
}