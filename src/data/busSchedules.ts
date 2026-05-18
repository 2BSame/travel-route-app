import { BusSchedule } from "../types/busSchedule";


//버스 스케줄이 안동 시청 홈페이지에 존재는 하나, 각 정류장 별로 언제 서는지는 나와있지 않음.
//고로 실제 정류장을 기반으로 하되, 정차 시간과 배차 간격, 소요 시간은 가상의 데이터를 사용했음.

// 코드의 가독성을 위해 09:00 ~ 22:00 (20분 간격) 공통 배열을 분리합니다.
const defaultDepartures = [
  "09:00", "09:20", "09:40", "10:00", "10:20", "10:40", "11:00", "11:20", "11:40",
  "12:00", "12:20", "12:40", "13:00", "13:20", "13:40", "14:00", "14:20", "14:40",
  "15:00", "15:20", "15:40", "16:00", "16:20", "16:40", "17:00", "17:20", "17:40",
  "18:00", "18:20", "18:40", "19:00", "19:20", "19:40", "20:00", "20:20", "20:40",
  "21:00", "21:20", "21:40", "22:00"
];

/**
 * 💡 위경도 거리 기반 예상 소요 시간(estimatedMinutes) 산출 (시속 약 20~30km 기준)
 * - 110번 노선: 안동터미널(1) ↔ 옥동(4) ↔ 신시장(2) ↔ 교보(3) ↔ 구역(5) ↔ 용상(6) ↔ 안동대(7)
 * - 210번 노선: 교보(3) ↔ 신시장(2) ↔ 안동터미널(1) ↔ 과학대(8) ↔ 풍산(9) ↔ 하회(10) ↔ 병산(11)
 */
export const busSchedules: BusSchedule[] = [
  // ==========================================
  // [110번 하행] 안동터미널(1) ➡️ 국립경국대(7)
  // ==========================================
  { id: 1, busNumber: "110", fromBusStopId: 1, toBusStopId: 4, departureTimes: defaultDepartures, estimatedMinutes: 7 },  // 터미널 -> 옥동 (약 2.5km)
  { id: 2, busNumber: "110", fromBusStopId: 4, toBusStopId: 2, departureTimes: defaultDepartures, estimatedMinutes: 6 },  // 옥동 -> 신시장 (약 2.0km)
  { id: 3, busNumber: "110", fromBusStopId: 2, toBusStopId: 3, departureTimes: defaultDepartures, estimatedMinutes: 3 },  // 신시장 -> 교보생명 (약 0.7km)
  { id: 4, busNumber: "110", fromBusStopId: 3, toBusStopId: 5, departureTimes: defaultDepartures, estimatedMinutes: 2 },  // 교보생명 -> 구안동역 (약 0.3km)
  { id: 5, busNumber: "110", fromBusStopId: 5, toBusStopId: 6, departureTimes: defaultDepartures, estimatedMinutes: 5 },  // 구안동역 -> 용상시장 (약 1.5km)
  { id: 6, busNumber: "110", fromBusStopId: 6, toBusStopId: 7, departureTimes: defaultDepartures, estimatedMinutes: 12 }, // 용상시장 -> 국립경국대 (약 4.5km)

  // ==========================================
  // [110번 상행] 국립경국대(7) ➡️ 안동터미널(1)
  // ==========================================
  { id: 7, busNumber: "110", fromBusStopId: 7, toBusStopId: 6, departureTimes: defaultDepartures, estimatedMinutes: 12 },
  { id: 8, busNumber: "110", fromBusStopId: 6, toBusStopId: 5, departureTimes: defaultDepartures, estimatedMinutes: 5 },
  { id: 9, busNumber: "110", fromBusStopId: 5, toBusStopId: 3, departureTimes: defaultDepartures, estimatedMinutes: 2 },
  { id: 10, busNumber: "110", fromBusStopId: 3, toBusStopId: 2, departureTimes: defaultDepartures, estimatedMinutes: 3 },
  { id: 11, busNumber: "110", fromBusStopId: 2, toBusStopId: 4, departureTimes: defaultDepartures, estimatedMinutes: 6 },
  { id: 12, busNumber: "110", fromBusStopId: 4, toBusStopId: 1, departureTimes: defaultDepartures, estimatedMinutes: 7 },

  // ==========================================
  // [210번 하행] 교보생명(3) ➡️ 병산서원(11)
  // ==========================================
  // *참고: 210번은 외곽으로 바로 빠지므로 옥동(4)을 경유하지 않음
  { id: 13, busNumber: "210", fromBusStopId: 3, toBusStopId: 2, departureTimes: defaultDepartures, estimatedMinutes: 3 },  // 교보생명 -> 신시장 (약 0.7km)
  { id: 14, busNumber: "210", fromBusStopId: 2, toBusStopId: 1, departureTimes: defaultDepartures, estimatedMinutes: 12 }, // 신시장 -> 터미널 (약 4.5km)
  { id: 15, busNumber: "210", fromBusStopId: 1, toBusStopId: 8, departureTimes: defaultDepartures, estimatedMinutes: 6 },  // 터미널 -> 안동과학대 (약 2.4km)
  { id: 16, busNumber: "210", fromBusStopId: 8, toBusStopId: 9, departureTimes: defaultDepartures, estimatedMinutes: 15 }, // 안동과학대 -> 풍산 (약 7.0km)
  { id: 17, busNumber: "210", fromBusStopId: 9, toBusStopId: 10, departureTimes: defaultDepartures, estimatedMinutes: 12 }, // 풍산 -> 하회마을 (약 5.5km)
  { id: 18, busNumber: "210", fromBusStopId: 10, toBusStopId: 11, departureTimes: defaultDepartures, estimatedMinutes: 8 }, // 하회마을 -> 병산서원 (약 2.6km)

  // ==========================================
  // [210번 상행] 병산서원(11) ➡️ 교보생명(3)
  // ==========================================
  { id: 19, busNumber: "210", fromBusStopId: 11, toBusStopId: 10, departureTimes: defaultDepartures, estimatedMinutes: 8 },
  { id: 20, busNumber: "210", fromBusStopId: 10, toBusStopId: 9, departureTimes: defaultDepartures, estimatedMinutes: 12 },
  { id: 21, busNumber: "210", fromBusStopId: 9, toBusStopId: 8, departureTimes: defaultDepartures, estimatedMinutes: 15 },
  { id: 22, busNumber: "210", fromBusStopId: 8, toBusStopId: 1, departureTimes: defaultDepartures, estimatedMinutes: 6 },
  { id: 23, busNumber: "210", fromBusStopId: 1, toBusStopId: 2, departureTimes: defaultDepartures, estimatedMinutes: 12 },
  { id: 24, busNumber: "210", fromBusStopId: 2, toBusStopId: 3, departureTimes: defaultDepartures, estimatedMinutes: 3 }
];