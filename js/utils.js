// 共通ユーティリティ関数

// JSONデータを取得
async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('データの取得に失敗しました');
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null;
  }
}

// リスクスコアに基づいてクラスを返す
function getRiskClass(risk) {
  if (risk >= 80) return 'risk-high';
  if (risk >= 50) return 'risk-medium';
  return 'risk-low';
}

// ステータスに基づいてクラスを返す
function getStatusClass(status) {
  if (status === 'error') return 'status-error';
  if (status === 'warning') return 'status-warning';
  return 'status-normal';
}

// ステータスに基づいて日本語を返す
function getStatusText(status) {
  const statusMap = {
    'normal': '正常',
    'warning': '注意',
    'error': '異常'
  };
  return statusMap[status] || status;
}

// ステータスに基づいてアイコンクラスを返す
function getStatusIcon(status) {
  if (status === 'error') return 'fas fa-times-circle';
  if (status === 'warning') return 'fas fa-exclamation-circle';
  return 'fas fa-check-circle';
}

// パーツ名を日本語に変換
function getPartName(part) {
  const partMap = {
    'engine': 'エンジン',
    'brake': 'ブレーキ',
    'battery': 'バッテリー',
    'tire': 'タイヤ',
    'aircon': 'エアコン'
  };
  return partMap[part] || part;
}

// 日付フォーマット
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// アラート表示
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#667eea'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => alertDiv.remove(), 300);
  }, 3000);
}

// CSSアニメーションを追加
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);





