// エンドユーザーアプリ：ホーム画面のロジック

let userVehicleData = null;
let alertDetailData = null;

// ページ読み込み時にデータを取得
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserVehicleData();
  await loadAlertDetailData();
  renderVehicleName();
  renderScoreMeter();
  renderVehicleIllustration();
  renderAlerts();
});

// ユーザー車両データを読み込む
async function loadUserVehicleData() {
  userVehicleData = await fetchJSON('data/user_vehicle.json');
  if (!userVehicleData) {
    showAlert('データの読み込みに失敗しました', 'error');
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
    alertDetailData = [];
  }
  // 配列でない場合は配列に変換
  if (!Array.isArray(alertDetailData)) {
    alertDetailData = [alertDetailData];
  }
}

// 車両名を表示
function renderVehicleName() {
  document.getElementById('vehicleName').textContent = userVehicleData.name;
}

// 健康スコアメーターを表示
function renderScoreMeter() {
  const canvas = document.getElementById('scoreMeter');
  const ctx = canvas.getContext('2d');
  const score = userVehicleData.score;
  
  // スコア値を表示
  document.getElementById('scoreValue').textContent = score;
  
  // スコアに応じて色を変更
  let color = '#10b981'; // 緑
  if (score < 50) {
    color = '#ef4444'; // 赤
  } else if (score < 70) {
    color = '#f59e0b'; // 黄
  }

  // ドーナツチャートを描画
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 100;
  const lineWidth = 30;

  // 背景円（グレー）
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  // スコア円（カラー）
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * score / 100));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 中央にスコアを表示
  ctx.fillStyle = '#333';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score, centerX, centerY - 10);
  
  ctx.font = '20px Arial';
  ctx.fillText('点', centerX, centerY + 25);
}

// 車両イラストを表示
function renderVehicleIllustration() {
  const container = document.getElementById('vehicleIllustration');
  container.innerHTML = '';
  
  const img = document.createElement('img');
  img.src = 'img/vehicle.png';
  img.alt = '車両イラスト';
  img.style.maxWidth = '100%';
  img.style.height = 'auto';
  container.appendChild(img);
}

// パーツ名と表示名のマッピング
const partNameMap = {
  engine: 'エンジンに異常',
  battery: 'バッテリー温度上昇',
  tire: 'タイヤ摩耗警告',
  brake: 'ブレーキシステム異常',
  aircon: 'エアコン異常'
};

// アラートを表示
function renderAlerts() {
  const alertList = document.getElementById('alertList');
  alertList.innerHTML = '';

  // parts の状態から warning 以上のパーツを取得
  const alertParts = [];
  for (const [partName, status] of Object.entries(userVehicleData.parts)) {
    if (status === 'warning' || status === 'error') {
      // alert_detail.json から対応する異常情報を取得
      const alertDetail = alertDetailData.find(a => a.part === partName);
      if (alertDetail) {
        alertParts.push({
          name: alertDetail.alert,
          status: status
        });
      } else {
        // alert_detail に対応する情報がない場合は、デフォルト名を使用
        alertParts.push({
          name: partNameMap[partName] || partName,
          status: status
        });
      }
    }
  }

  if (alertParts.length === 0) {
    alertList.innerHTML = '<li style="color: #666; padding: 1rem;">異常は検知されていません</li>';
    return;
  }

  alertParts.forEach(alert => {
    const li = document.createElement('li');
    li.className = alert.status === 'error' ? 'alert-item alert-error' : 'alert-item alert-warning';
    li.textContent = `⚠️ ${alert.name}`;
    alertList.appendChild(li);
  });
}

// 詳細画面に遷移
function goToDetail() {
  window.location.href = 'user-alert.html';
}

// 整備予約
function bookMaintenance() {
  showAlert('整備予約画面に遷移します', 'info');
  // デモ用：実際の予約システムへのリンクなど
  setTimeout(() => {
    showAlert('予約機能は準備中です', 'info');
  }, 1000);
}





