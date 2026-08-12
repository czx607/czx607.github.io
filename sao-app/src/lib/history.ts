export type HistoryType = 'qrcode' | 'bill';

export interface IBillItem {
  name: string;
  amount: number;
  quantity?: number;
}

export interface IBillData {
  totalAmount: number;
  date: string;
  merchant: string;
  items: IBillItem[];
  imagePreview?: string;
}

export interface IHistoryItem {
  id: string;
  type: HistoryType;
  content?: string;
  billData?: IBillData;
  createdAt: number;
  shareText: string;
}

const STORAGE_KEY = 'sao_history';

export function getHistory(): IHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IHistoryItem[];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error('读取历史记录失败:', String(e));
    return [];
  }
}

export function saveHistory(
  item: Omit<IHistoryItem, 'id' | 'createdAt' | 'shareText'> & {
    shareText?: string;
  }
): IHistoryItem {
  const fullItem: IHistoryItem = {
    ...item,
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    shareText: item.shareText ?? buildShareText(item),
  };

  const all = getHistory();
  all.unshift(fullItem);
  const trimmed = all.slice(0, 100);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('保存历史记录失败:', String(e));
  }

  return fullItem;
}

export function deleteHistory(id: string): void {
  const all = getHistory();
  const filtered = all.filter((i) => i.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('删除历史记录失败:', String(e));
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('清空历史记录失败:', String(e));
  }
}

export function findHistoryById(id: string): IHistoryItem | undefined {
  const all = getHistory();
  return all.find((i) => i.id === id);
}

export function filterHistoryByType(
  type: 'all' | HistoryType
): IHistoryItem[] {
  const all = getHistory();
  if (type === 'all') return all;
  return all.filter((i) => i.type === type);
}

export function buildShareText(item: {
  type: HistoryType;
  content?: string;
  billData?: IBillData;
}): string {
  if (item.type === 'qrcode') {
    return `【扫码结果】\n${item.content ?? ''}`;
  }

  if (item.type === 'bill' && item.billData) {
    const { totalAmount, date, merchant, items } = item.billData;
    const lines = items.map((it, idx) => {
      const qty = it.quantity ?? 1;
      const qtyText = qty > 1 ? ` ×${qty}` : '';
      return `${idx + 1}. ${it.name}${qtyText}  ¥${it.amount.toFixed(2)}`;
    });
    return [
      `【账单】${merchant}`,
      `日期：${date}`,
      `合计：¥${totalAmount.toFixed(2)}`,
      '',
      '明细：',
      ...lines,
    ].join('\n');
  }

  return '';
}
