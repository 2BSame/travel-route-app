import React, { useState } from 'react';


const MAP_IMAGE_URL = 'andong_map.PNG'; 

function TravelRouteApp() {
  // 1. 안동 명소에 맞춘 초기 동선 스펙 (가로 x, 세로 y % 비율 좌표)
  // 실제 약도 그림을 보시면서 명소들의 위치 비율(0 ~ 100)을 숫자로 미세 조정해 주세요!
  const [routePoints, setRoutePoints] = useState([
    { id: 1, name: '안동역/터미널 (출발지)', x: 20, y: 45 },
    { id: 2, name: '안동 찜닭골목', x: 45, y: 50 },
    { id: 3, name: '월영교', x: 70, y: 35 },
    { id: 4, name: '낙강물길공원 (도착지)', x: 85, y: 25 }
  ]);

  // 2. 순서 변경 함수: 위로 이동
  const moveUp = (index) => {
    if (index === 0) return;
    const newPoints = [...routePoints];
    const temp = newPoints[index];
    newPoints[index] = newPoints[index - 1];
    newPoints[index - 1] = temp;
    setRoutePoints(newPoints);
  };

  // 3. 순서 변경 함수: 아래로 이동 (3차 검토 시 추가된 UX 개선 항목)
  const moveDown = (index) => {
    if (index === routePoints.length - 1) return;
    const newPoints = [...routePoints];
    const temp = newPoints[index];
    newPoints[index] = newPoints[index + 1];
    newPoints[index + 1] = temp;
    setRoutePoints(newPoints);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '5px', color: '#333' }}>안동 여행 경로 플래너</h2>
      <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px' }}>
        등록된 안동시내 약도 이미지 위에 동선과 방문 순서를 실시간으로 표시합니다.
      </p>

      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
        
        {/* 왼쪽: 지도 사진 및 마커/레이어 영역 */}
        <div style={{ flex: 2, minWidth: '350px' }}>
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
            
            {/* 배경 지도 이미지 */}
            <img 
              src={MAP_IMAGE_URL} 
              alt="안동시내 약도" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />

            {/* SVG를 이용한 경로 연결선 (마커보다 뒤에 렌더링되도록 먼저 배치) */}
            <svg 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none',
                zIndex: 5 
              }}
            >
              {routePoints.map((point, index) => {
                if (index === routePoints.length - 1) return null;
                const nextPoint = routePoints[index + 1];
                return (
                  <line
                    key={`line-${point.id}`}
                    x1={`${point.x}%`}
                    y1={`${point.y}%`}
                    x2={`${nextPoint.x}%`}
                    y2={`${nextPoint.y}%`}
                    stroke="#FF5A5F"
                    strokeWidth="3.5"
                    strokeDasharray="6,6" // 점선 스타일
                    strokeOpacity="0.85"
                  />
                );
              })}
            </svg>

            {/* 이미지 위에 커스텀 마커 배정 */}
            {routePoints.map((point, index) => (
              <div
                key={point.id}
                style={{
                  position: 'absolute',
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '30px',
                  height: '30px',
                  backgroundColor: '#FF5A5F',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: '2px solid white',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                  zIndex: 10
                }}
                title={point.name}
              >
                {index + 1}
                
                {/* 장소 이름 네임태그 (2차 검토 반영: 중앙 정렬 수식 적용) */}
                <div style={{
                  position: 'absolute',
                  top: '36px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(33, 33, 33, 0.85)',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {point.name}
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* 오른쪽: 방문 순서 편집 리스트 UI 영역 */}
        <div style={{ flex: 1, minWidth: '300px', background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e9ecef', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '2px solid #dee2e6', paddingBottom: '10px', color: '#495057' }}>
            방문 순서 정렬
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {routePoints.map((point, index) => (
              <li 
                key={point.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '14px 12px', 
                  marginBottom: '10px', 
                  background: '#fff', 
                  borderRadius: '8px',
                  border: '1px solid #f1f3f5',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                  <strong style={{ color: '#FF5A5F', marginRight: '10px', fontSize: '16px' }}>{index + 1}</strong>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#343a40' }}>{point.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {/* 위로 이동 버튼 */}
                  <button 
                    onClick={() => moveUp(index)} 
                    disabled={index === 0}
                    style={{
                      padding: '5px 8px',
                      background: index === 0 ? '#e9ecef' : '#007BFF',
                      color: index === 0 ? '#adb5bd' : '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ▲
                  </button>
                  {/* 아래로 이동 버튼 */}
                  <button 
                    onClick={() => moveDown(index)} 
                    disabled={index === routePoints.length - 1}
                    style={{
                      padding: '5px 8px',
                      background: index === routePoints.length - 1 ? '#e9ecef' : '#007BFF',
                      color: index === routePoints.length - 1 ? '#adb5bd' : '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: index === routePoints.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ▼
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default TravelRouteApp;
