import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QrCode, Receipt, Trash2, Clock, History } from 'lucide-react';
import { getHistory, deleteHistory, clearHistory } from '@/lib/history';
import type { IHistoryItem, HistoryType } from '@/lib/history';

export default function MinePage() {
  const [history, setHistory] = useState<IHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | HistoryType>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return history;
    return history.filter((i) => i.type === activeTab);
  }, [history, activeTab]);

  const handleItemClick = (id: string) => {
    navigate(`/result/${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistory(id);
    setHistory((prev) => prev.filter((i) => i.id !== id));
    toast.success('已删除');
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
    toast.success('已清空全部记录');
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - ts;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < oneDay) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 7 * oneDay) return `${Math.floor(diff / oneDay)} 天前`;

    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getSummary = (item: IHistoryItem): string => {
    if (item.type === 'qrcode') {
      return item.content ?? '';
    }
    if (item.type === 'bill' && item.billData) {
      return `${item.billData.merchant} · ¥${item.billData.totalAmount.toFixed(2)}`;
    }
    return '';
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold">我的</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            历史记录 · 共 {history.length} 条
          </p>
        </div>
      </div>

      <div className="flex w-full rounded-lg bg-muted p-1">
        {(['all', 'qrcode', 'bill'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-card text-foreground shadow'
                : 'text-muted-foreground'
            }`}
          >
            {tab === 'all' ? '全部' : tab === 'qrcode' ? '扫码' : '账单'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
            <History className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">暂无记录</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              扫码或识别账单后，记录会显示在这里
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/40 bg-card p-4 transition-colors hover:border-primary/30 active:scale-[0.98]"
              onClick={() => handleItemClick(item.id)}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  item.type === 'qrcode'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-accent text-accent-foreground'
                }`}
              >
                {item.type === 'qrcode' ? (
                  <QrCode className="h-5 w-5" />
                ) : (
                  <Receipt className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {item.type === 'qrcode' ? '扫码' : '账单'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">
                  {getSummary(item)}
                </p>
              </div>

              <button
                className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDelete(e, item.id)}
                aria-label="删除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="pt-4">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="mr-2 inline h-4 w-4" />
            清空全部记录
          </button>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-sm rounded-xl bg-card p-6">
            <h3 className="text-lg font-semibold">确认清空全部记录？</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              此操作将删除所有扫码和账单识别记录，且无法恢复。
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground"
              >
                取消
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 text-center text-xs text-muted-foreground/60">
        <p>扫 · 纯净无广告</p>
      </div>
    </div>
  );
}
