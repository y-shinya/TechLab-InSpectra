// エンドユーザーアプリ：異常詳細画面のロジック

let userVehicleData = null;
let alertDetailData = null;

// ページ読み込み時にデータを取得
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserVehicleData();
  await loadAlertDetailData();
  renderAlertInfo();
  renderAIComment();
  renderRecommendation();
  renderHistoryChart();
});

// ユーザー車両データを読み込む
async function loadUserVehicleData() {
  userVehicleData = await fetchJSON('data/user_vehicle.json');
  if (!userVehicleData) {
    userVehicleData = {
      id: 'CAR001',
      name: 'Unknown',
      score: 0,
      parts: {}
    };
  }
}

// 異常詳細データを読み込む
async function loadAlertDetailData() {
  alertDetailData = await fetchJSON('data/alert_detail.json');
  if (!alertDetailData) {
    showAlert('データの読み込みに失敗しました', 'error');
    alertDetailData = [];
  }
  // 配列でない場合は配列に変換
  if (!Array.isArray(alertDetailData)) {
    alertDetailData = [alertDetailData];
  }
  
  // user_vehicle.json の parts に基づいてフィルタリング
  alertDetailData = alertDetailData.filter(alert => {
    // parts に存在して、warning または error のパーツのみ取得
    const partStatus = userVehicleData.parts[alert.part];
    return partStatus === 'warning' || partStatus === 'error';
  });
}

// 異常情報を表示
function renderAlertInfo() {
  const container = document.getElementById('alertDetailsContainer');
  container.innerHTML = '';

  alertDetailData.forEach((alert, index) => {
    const alertDiv = document.createElement('div');
    alertDiv.style.marginBottom = '1.5rem';
    alertDiv.style.paddingBottom = '1.5rem';
    if (index < alertDetailData.length - 1) {
      alertDiv.style.borderBottom = '1px solid #eee';
    }

    // パーツの状態に応じてクラスを決定
    const partStatus = userVehicleData.parts[alert.part];
    const statusClass = partStatus === 'error' ? 'status-error' : 'status-warning';

    alertDiv.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <strong>対象部品:</strong> <span class="status-badge ${statusClass}">${getPartName(alert.part)}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>異常内容:</strong> <span>${alert.alert}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>検出日時:</strong> <span>${alert.detected}</span>
      </div>
    `;

    container.appendChild(alertDiv);
  });
}

// AI診断コメントを表示
function renderAIComment() {
  const container = document.getElementById('aiComment');
  container.innerHTML = '';

  alertDetailData.forEach((alert, index) => {
    if (index > 0) {
      // 2件目以降は区切り線を追加
      const separator = document.createElement('div');
      separator.style.borderTop = '1px solid #e0e0e0';
      separator.style.margin = '1rem 0';
      container.appendChild(separator);
    }

    const commentDiv = document.createElement('div');
    commentDiv.style.marginBottom = '0.5rem';
    
    const partLabel = document.createElement('strong');
    partLabel.textContent = `【${getPartName(alert.part)}】`;
    partLabel.style.display = 'block';
    partLabel.style.marginBottom = '0.5rem';
    partLabel.style.color = '#667eea';
    
    const commentText = document.createElement('p');
    commentText.textContent = alert.comment;
    commentText.style.margin = '0';
    commentText.style.lineHeight = '1.8';

    commentDiv.appendChild(partLabel);
    commentDiv.appendChild(commentText);
    container.appendChild(commentDiv);
  });
}

// 推奨アクションを表示
function renderRecommendation() {
  const container = document.getElementById('recommendationContainer');
  container.innerHTML = '';

  alertDetailData.forEach((alert, index) => {
    const partStatus = userVehicleData.parts[alert.part];
    const isError = partStatus === 'error';
    
    const bgColor = isError ? '#fee2e2' : '#fef3c7';
    const borderColor = isError ? '#ef4444' : '#f59e0b';
    const textColor = isError ? '#991b1b' : '#92400e';

    const recBox = document.createElement('div');
    recBox.style.padding = '1rem';
    recBox.style.background = bgColor;
    recBox.style.borderRadius = '8px';
    recBox.style.borderLeft = `4px solid ${borderColor}`;
    recBox.style.marginBottom = index < alertDetailData.length - 1 ? '1rem' : '0';

    const partLabel = document.createElement('strong');
    partLabel.textContent = `【${getPartName(alert.part)}】`;
    partLabel.style.display = 'block';
    partLabel.style.marginBottom = '0.5rem';
    partLabel.style.color = borderColor;
    
    const recText = document.createElement('p');
    recText.textContent = alert.recommend;
    recText.style.margin = '0';
    recText.style.lineHeight = '1.8';
    recText.style.fontWeight = '600';
    recText.style.color = textColor;

    recBox.appendChild(partLabel);
    recBox.appendChild(recText);
    container.appendChild(recBox);
  });
}

// 過去比較グラフを表示
function renderHistoryChart() {
  const ctx = document.getElementById('historyChart').getContext('2d');
  
  // 表示対象を最初の異常に設定
  const alert = alertDetailData[0];
  
  // 過去の日付ラベルを生成（デモ用）
  const days = [];
  const today = new Date();
  for (let i = alert.history.length - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (alert.history.length - 1 - i));
    days.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'リスクスコア',
        data: alert.history,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
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

// 近隣工場を予約
function bookNearbyWorkshop() {
  showAlert('近隣工場の検索中...', 'info');
  setTimeout(() => {
    showAlert('予約機能は準備中です。整備工場への直接連絡をお願いします。', 'info');
  }, 1500);
}

// 整備記録を確認
function viewMaintenanceHistory() {
  showAlert('整備記録画面に遷移します', 'info');
  // デモ用：実際の整備記録ページへのリンクなど
  setTimeout(() => {
    window.location.href = 'detail.html?id=CAR001';
  }, 1000);
}





