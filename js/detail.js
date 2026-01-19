// 管理画面：車両詳細ページのロジック

let detailData = null;

// ページ読み込み時にデータを取得
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const customerId = urlParams.get('customerId') || 'CUST001';
  
  initializeUI();
  await loadDetailData(customerId);
  renderVehicleInfo();
  renderPartsStatus();
  renderRiskChart();
  renderMaintenanceHistory();
});

// UI初期化
function initializeUI() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarToggleMobile = document.getElementById('sidebarToggleMobile');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }
  if (sidebarToggleMobile) {
    sidebarToggleMobile.addEventListener('click', toggleSidebarMobile);
  }
}

// サイドバー切り替え
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('collapsed');
}

// モバイル用サイドバー切り替え
function toggleSidebarMobile() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}

// 詳細データを読み込む（顧客IDを主キーとして使用）
async function loadDetailData(customerId) {
  detailData = await fetchJSON(`data/detail_${customerId}.json`);
  if (!detailData) {
    showAlert('データの読み込みに失敗しました', 'error');
    // デフォルトデータを使用
    detailData = {
      customerId: customerId,
      customerName: '-',
      vehicleId: '-',
      name: 'Unknown',
      distance: 0,
      lastCheck: '-',
      parts: {},
      riskHistory: [],
      maintenance: []
    };
  }
}

// 車両情報を表示
function renderVehicleInfo() {
  document.getElementById('customerId').textContent = detailData.customerId || '-';
  document.getElementById('customerName').textContent = detailData.customerName || '-';
  document.getElementById('vehicleName').textContent = detailData.vehicleName || detailData.name || '-';
  document.getElementById('vehicleId').textContent = detailData.vehicleId || detailData.id || '-';
  document.getElementById('vehicleDistance').textContent = detailData.distance ? detailData.distance.toLocaleString() + ' km' : '-';
  document.getElementById('lastCheck').textContent = detailData.lastCheck || '-';
}

// 各部品の状態を表示
function renderPartsStatus() {
  const partsGrid = document.getElementById('partsGrid');
  partsGrid.innerHTML = '';

  const partIcons = {
    engine: 'fa-cog',
    brake: 'fa-hand-paper',
    battery: 'fa-battery-three-quarters',
    tire: 'fa-ring',
    aircon: 'fa-snowflake'
  };

  const partNames = {
    engine: 'エンジン',
    brake: 'ブレーキ',
    battery: 'バッテリー',
    tire: 'タイヤ',
    aircon: 'エアコン'
  };

  Object.entries(detailData.parts).forEach(([partKey, partData]) => {
    // 古いデータ形式（文字列）との互換性対応
    let partInfo;
    if (typeof partData === 'string') {
      partInfo = {
        status: partData,
        level: partData === 'normal' ? '良好' : partData === 'warning' ? '注意' : '異常',
        detail: partNames[partKey] + 'の状態',
        severity: partData === 'normal' ? 0 : partData === 'warning' ? 2 : 3
      };
    } else {
      partInfo = partData;
    }

    const partCard = document.createElement('div');
    partCard.className = `part-card part-card-${partInfo.status}`;
    
    const statusColor = partInfo.status === 'normal' ? '#10b981' : 
                       partInfo.status === 'warning' ? '#f59e0b' : '#ef4444';
    
    partCard.innerHTML = `
      <div class="part-card-header">
        <i class="fas ${partIcons[partKey]}" style="color: ${statusColor}; font-size: 1.5rem;"></i>
        <div class="part-card-title">
          <h4>${partNames[partKey]}</h4>
          <span class="part-card-level">${partInfo.level}</span>
        </div>
      </div>
      <div class="part-card-detail">
        <p>${partInfo.detail}</p>
      </div>
      <div class="part-card-status">
        <span class="status-badge ${getStatusClass(partInfo.status)}">
          <i class="${getStatusIcon(partInfo.status)}"></i>
          ${getStatusText(partInfo.status)}
        </span>
      </div>
    `;
    
    partsGrid.appendChild(partCard);
  });
}

// リスク推移グラフを表示
function renderRiskChart() {
  const canvas = document.getElementById('riskChart');
  if (!canvas) return; // canvas が無ければスキップ

  const ctx = canvas.getContext('2d');

  // 以下、元の Chart.js 初期化
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }

  const riskData = [...detailData.riskHistory];
  while (riskData.length < 30) {
    riskData.push(riskData[riskData.length - 1] || 0);
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'リスクスコア',
        data: riskData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// 整備履歴を表示
function renderMaintenanceHistory() {
  const tbody = document.getElementById('maintenanceTableBody');
  tbody.innerHTML = '';

  if (detailData.maintenance.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">整備履歴がありません</td></tr>';
    return;
  }

  detailData.maintenance.forEach(maintenance => {
    const row = document.createElement('tr');
    const statusClass = maintenance.status === '完了' ? 'status-normal' : 
                        maintenance.status === '要再検' ? 'status-warning' : 'status-error';
    
    row.innerHTML = `
      <td>${maintenance.date}</td>
      <td>${maintenance.task}</td>
      <td><span class="status-badge ${statusClass}">${maintenance.status}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// 整備工場に連絡
function contactWorkshop() {
  showAlert('整備工場に連絡しました。担当者から折り返し連絡があります。', 'success');
}

// AI再診断
function reDiagnose() {
  showAlert('AI再診断を開始しました。数分後に結果が更新されます。', 'info');
  // デモ用：少し遅延して再読み込み
  setTimeout(() => {
    location.reload();
  }, 2000);
}

