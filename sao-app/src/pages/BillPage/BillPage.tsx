import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Camera, Image as ImageIcon, Copy, Loader2, RotateCcw } from 'lucide-react';
import { recognizeBill } from '@/lib/bill-ocr';
import { saveHistory, buildShareText } from '@/lib/history';
import type { IBillData, IHistoryItem } from '@/lib/history';

export default function BillPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [result, setResult] = useState<IBillData | null>(null);
  const [savedRecord, setSavedRecord] = useState<IHistoryItem | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setSavedRecord(null);

    startRecognize(file);
    e.target.value = '';
  };

  const startRecognize = async (file: File) => {
    setIsRecognizing(true);
    try {
      const billData = await recognizeBill(file);

      if (
        !billData.merchant &&
        billData.totalAmount === 0 &&
        billData.items.length === 0
      ) {
        toast.error('未能识别出账单信息，请确保图片清晰');
        setIsRecognizing(false);
        return;
      }

      setResult(billData);

      const saved = saveHistory({
        type: 'bill',
        billData: {
          ...billData,
          imagePreview: undefined,
        },
        shareText: buildShareText({ type: 'bill', billData }),
      });
      setSavedRecord(saved);
      toast.success('识别完成');
    } catch (e) {
      console.error('账单识别失败:', String(e));
      toast.error('识别失败，请重试');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setSavedRecord(null);
  };

  const handleCopy = async () => {
    if (!savedRecord) return;
    try {
      await navigator.clipboard.writeText(savedRecord.shareText);
      toast.success('已复制，可粘贴到微信/短信');
    } catch (e) {
      console.error('复制失败:', String(e));
      toast.error('复制失败');
    }
  };

  const handleViewDetail = () => {
    if (!savedRecord) return;
    navigate(`/result/${savedRecord.id}`);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">账单识别</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          拍照或上传账单，AI 自动识别明细
        </p>
      </div>

      {!selectedFile && (
        <div className="space-y-3">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={albumInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            className="flex h-16 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-medium text-primary-foreground"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-5 w-5" />
            拍照识别
          </button>

          <button
            className="flex h-16 w-full items-center justify-center gap-2 rounded-lg bg-secondary text-base font-medium text-secondary-foreground"
            onClick={() => albumInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
            从相册选择
          </button>

          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              支持小票、发票、收据等各类账单
              <br />
              自动识别金额、日期、商家和消费明细
            </p>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border/40">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="账单预览"
                className="max-h-[50vh] w-full object-contain"
              />
            )}
            {isRecognizing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 text-white">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium">AI 正在识别中…</p>
                  <p className="text-xs text-white/60">通常需要 3-10 秒</p>
                </div>
              </div>
            )}
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground disabled:opacity-50"
            onClick={handleReset}
            disabled={isRecognizing}
          >
            <RotateCcw className="h-4 w-4" />
            重新选择图片
          </button>

          {result && (
            <div className="rounded-xl border border-primary/20 bg-card p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">识别结果</h2>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">已保存</span>
              </div>

              <div className="mb-4 rounded-xl bg-primary/10 p-4 text-center">
                <p className="text-xs text-muted-foreground">总金额</p>
                <p className="mt-1 text-4xl font-bold text-primary tabular-nums">
                  ¥{result.totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">商家</p>
                  <p className="mt-1 font-medium">{result.merchant || '未识别'}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">日期</p>
                  <p className="mt-1 font-medium tabular-nums">
                    {result.date || '未识别'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-sm font-medium">消费明细</p>
                <div className="space-y-2">
                  {result.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity && item.quantity > 1
                          ? `×${item.quantity} `
                          : ''}
                      </span>
                      <span className="ml-2 shrink-0 font-medium tabular-nums">
                        ¥{item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
                >
                  <Copy className="h-4 w-4" />
                  复制整理
                </button>
                <button
                  onClick={handleViewDetail}
                  className="flex flex-1 items-center justify-center rounded-lg bg-secondary px-4 py-3 font-medium text-secondary-foreground"
                >
                  查看详情
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
