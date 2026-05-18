import { BusStop } from "../types/busStop";

export const busStops: BusStop[] = [
  // --- 110번 & 210번 공통 (교차/환승 구간) ---
  {
    id: 1,
    name: "안동역(안동터미널)",
    latitude: 36.574532,
    longitude: 128.6756595,
    availableBus: ["110", "210"]
  },
  {
    id: 2,
    name: "신시장",
    latitude: 36.5635635,
    longitude: 128.7238249,
    availableBus: ["110", "210"]
  },
  {
    id: 3,
    name: "교보생명", 
    latitude: 36.5629763,
    longitude: 128.7312389,
    availableBus: ["110", "210"]
  },

  //110번
  {
    id: 4,
    name: "옥동농협앞",
    latitude: 36.5628486,
    longitude: 128.7012523,
    availableBus: ["110"]
  },
  {
    id: 5,
    name: "구 안동역", 
    latitude: 36.5635063,
    longitude: 128.7342203,
    availableBus: ["110"]
  },
  {
    id: 6,
    name: "용상시장",
    latitude: 36.5599517,
    longitude: 128.7508198,
    availableBus: ["110"]
  },
  {
    id: 7,
    name: "국립경국대",
    latitude: 36.5419567,
    longitude: 128.7969108,
    availableBus: ["110"]
  },

  //210번
  {
    id: 8,
    name: "안동과학대학교",
    latitude: 36.5871084,
    longitude: 128.653029,
    availableBus: ["210"]
  },
  {
    id: 9,
    name: "풍산정류장",
    latitude: 36.5783268,
    longitude: 128.5776989,
    availableBus: ["210"]
  },
  {
    id: 10,
    name: "하회마을",
    latitude: 36.5488782,
    longitude: 128.5284549,
    availableBus: ["210"]
  },
  {
    id: 11,
    name: "병산서원",
    latitude: 36.5422363,
    longitude: 128.5565804,
    availableBus: ["210"]
  },
  {
    id: 12,
    name: "송현오거리",
    latitude: 36.5720832,
    longitude: 128.698162,
    availableBus: ["210"]
  }
];