import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Copy,
  Share2,
  QrCode,
  Receipt,
  Calendar,
  Store,
} from 'lucide-react';
import { findHistoryById } from '@/lib/history';
import type { IHistoryItem } from '@/lib/history';

export default function ResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<IHistoryItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    const found = findHistoryById(id);
    if (found) {
      setItem(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const handleCopy = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.shareText);
      toast.success('已复制，可粘贴到微信/短信');
    } catch (e) {
      console.error('复制失败:', String(e));
      toast.error('复制失败');
    }
  };

  const handleShare = async () => {
    if (!item) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.type === 'qrcode' ? '扫码结果' : '账单信息',
          text: item.shareText,
        });
        return;
      } catch (e) {
        console.info('分享已取消');
        return;
      }
    }
    handleCopy();
  };

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">记录不存在或已被删除</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">加载中…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-8">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 hover:bg-muted"
          aria-label="返回"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">结果详情</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
          {item.type === 'qrcode' ? (
            <>
              <QrCode className="h-3.5 w-3.5" /> 扫码结果
            </>
          ) : (
            <>
              <Receipt className="h-3.5 w-3.5" /> 账单识别
            </>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {item.type === 'qrcode' && item.content && (
        <div className="rounded-xl border border-border/40 bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">扫码内容</h2>
          <div className="break-all rounded-lg bg-muted/50 p-4 font-mono text-sm">
            {item.content}
          </div>
        </div>
      )}

      {item.type === 'bill' && item.billData && (
        <div className="rounded-xl border border-primary/20 bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">账单信息</h2>

          <div className="mb-4 rounded-xl bg-primary/10 p-5 text-center">
            <p className="text-xs text-muted-foreground">总金额</p>
            <p className="mt-1 text-4xl font-bold text-primary tabular-nums">
              ¥{item.billData.totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Store className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">商家</p>
                <p className="truncate font-medium">
                  {item.billData.merchant || '未识别'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">日期</p>
                <p className="font-medium tabular-nums">
                  {item.billData.date || '未识别'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">消费明细</p>
            <div className="overflow-hidden rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-normal text-muted-foreground">项目</th>
                    <th className="px-3 py-2 text-center font-normal text-muted-foreground">数量</th>
                    <th className="px-3 py-2 text-right font-normal text-muted-foreground">金额</th>
                  </tr>
                </thead>
                <tbody>
                  {item.billData.items.map((it, idx) => (
                    <tr key={idx} className="border-t border-border/40">
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2 text-center tabular-nums">
                        {it.quantity ?? 1}
                      </td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">
                        ¥{it.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-card p-5">
        <h2 className="mb-3 text-base font-semibold">整理文本</h2>
        <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
          {item.shareText}
        </pre>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
        >
          <Copy className="h-4 w-4" />
          复制全部
        </button>
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-medium text-secondary-foreground"
        >
          <Share2 className="h-4 w-4" />
          分享
        </button>
      </div>
    </div>
  );
}
