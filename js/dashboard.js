// 管理画面TOP（企業ダッシュボード）のロジック

let vehiclesData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;

// ページ読み込み時にデータを取得
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
  initializeUI();
  renderKPI();
  renderPriorityTable();
  renderTrendChart();
  setupEventListeners();
  updateLastUpdateTime();
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

// ダッシュボードデータを読み込む
async function loadDashboardData() {
  vehiclesData = await fetchJSON('data/vehicles.json');
  if (!vehiclesData) {
    vehiclesData = [];
  }
  // リスクスコアでソート（高い順）
  vehiclesData.sort((a, b) => b.risk - a.risk);
  filteredData = [...vehiclesData];
}

// KPIカードを表示
function renderKPI() {
  const warningVehicles = vehiclesData.filter(v => v.status === 'warning').length;
  const errorVehicles = vehiclesData.filter(v => v.status === 'error').length;

  document.getElementById('warningVehicles').textContent = warningVehicles;
  document.getElementById('errorVehicles').textContent = errorVehicles;
}

// イベントリスナー設定
function setupEventListeners() {
  // ステータスフィルター
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }

  // 選択チェックボックス
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('change', toggleSelectAll);
  }

  // エクスポートボタン
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportTableData);
  }
}

// フィルター適用
function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  
  filteredData = vehiclesData.filter(vehicle => {
    if (statusFilter && vehicle.status !== statusFilter) {
      return false;
    }
    return true;
  });

  currentPage = 1;
  renderPriorityTable();
}

// テーブルデータ表示（ページング対応）
function renderPriorityTable() {
  const tbody = document.getElementById('priorityTableBody');
  tbody.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach(customer => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="row-checkbox"></td>
      <td><strong>${customer.customerId || '-'}</strong></td>
      <td>${customer.vehicleId || '-'}</td>
      <td>${customer.name}</td>
      <td><span class="${getRiskClass(customer.risk)}">${customer.risk}</span></td>
      <td><span class="status-badge ${getStatusClass(customer.status)}"><i class="${getStatusIcon(customer.status)}"></i> ${getStatusText(customer.status)}</span></td>
      <td>${customer.lastCheck}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="goToDetail('${customer.customerId}')"><i class="fas fa-eye"></i> 詳細</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // ページング情報を更新
  updatePaginationInfo();
}

// ページング情報更新
function updatePaginationInfo() {
  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  document.getElementById('totalCount').textContent = totalCount;
  document.getElementById('pageCount').textContent = totalCount > 0 ? endIndex - startIndex + 1 : 0;
  document.getElementById('currentPage').textContent = totalPages > 0 ? currentPage : 0;
  document.getElementById('totalPages').textContent = totalPages;
}

// 全件選択
function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.row-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
}

// テーブルをCSVでエクスポート
function exportTableData() {
  let csv = 'data:text/csv;charset=utf-8,';
  
  // ヘッダー行
  const headers = ['顧客ID', '車両ID', '車種', 'リスクスコア', 'ステータス', '最終検査日'];
  csv += headers.join(',') + '\n';

  // データ行
  filteredData.forEach(vehicle => {
    const row = [
      vehicle.customerId,
      vehicle.vehicleId,
      vehicle.name,
      vehicle.risk,
      getStatusText(vehicle.status),
      vehicle.lastCheck
    ];
    csv += row.join(',') + '\n';
  });

  const link = document.createElement('a');
  link.href = encodeURI(csv);
  link.download = `整備優先度リスト_${new Date().getTime()}.csv`;
  link.click();
}

// 異常傾向の推移グラフを表示
function renderTrendChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  const context = ctx.getContext('2d');
  
  // デモ用データ：過去7週間の異常車両数
  const weeks = ['5週前', '4週前', '3週前', '2週前', '1週前', '今週', '来週予測'];
  const warningData = [2, 3, 2, 4, 3, 2, 2];
  const errorData = [1, 0, 1, 1, 1, 1, 1];

  new Chart(context, {
    type: 'line',
    data: {
      labels: weeks,
      datasets: [
        {
          label: '注意車両',
          data: warningData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
        },
        {
          label: '異常車両',
          data: errorData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12, weight: '500' }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ステータス分布グラフを表示
function renderStatusChart() {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  const context = ctx.getContext('2d');
  
  const normalCount = vehiclesData.filter(v => v.status === 'normal').length;
  const warningCount = vehiclesData.filter(v => v.status === 'warning').length;
  const errorCount = vehiclesData.filter(v => v.status === 'error').length;

  new Chart(context, {
    type: 'doughnut',
    data: {
      labels: ['正常', '注意', '異常'],
      datasets: [{
        data: [normalCount, warningCount, errorCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12, weight: '500' }
          }
        }
      }
    }
  });
}

// ステータス分布グラフを表示
function renderStatusChart() {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  const context = ctx.getContext('2d');
  
  const normalCount = vehiclesData.filter(v => v.status === 'normal').length;
  const warningCount = vehiclesData.filter(v => v.status === 'warning').length;
  const errorCount = vehiclesData.filter(v => v.status === 'error').length;

  new Chart(context, {
    type: 'doughnut',
    data: {
      labels: ['正常', '注意', '異常'],
      datasets: [{
        data: [normalCount, warningCount, errorCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: 'white',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12, weight: '500' }
          }
        }
      }
    }
  });
}

// 最終更新時刻を更新
function updateLastUpdateTime() {
  const now = new Date();
  const timeStr = now.getFullYear() + '/' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '/' +
                  String(now.getDate()).padStart(2, '0') + ' ' +
                  String(now.getHours()).padStart(2, '0') + ':' +
                  String(now.getMinutes()).padStart(2, '0');
  
  const timeElement = document.getElementById('lastUpdateTime');
  if (timeElement) {
    timeElement.textContent = timeStr;
  }
}

// ステータスアイコン取得
function getStatusIcon(status) {
  switch(status) {
    case 'normal':
      return 'fas fa-check-circle';
    case 'warning':
      return 'fas fa-exclamation-circle';
    case 'error':
      return 'fas fa-times-circle';
    default:
      return 'fas fa-question-circle';
  }
}

// 詳細ページに遷移（顧客IDを主キーとして使用）
function goToDetail(customerId) {
  window.location.href = `detail.html?customerId=${customerId}`;
}

