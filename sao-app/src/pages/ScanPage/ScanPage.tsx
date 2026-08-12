import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Copy, X, ArrowRight, Camera } from 'lucide-react';
import jsQR from 'jsqr';
import { saveHistory, buildShareText } from '@/lib/history';
import type { IHistoryItem } from '@/lib/history';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const hasScannedRef = useRef(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<IHistoryItem | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
        hasScannedRef.current = false;
        scanLoop();
      }
    } catch (e) {
      console.error('摄像头启动失败:', String(e));
      setCameraError('无法访问摄像头，请检查权限设置');
      setIsCameraOn(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      animationRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && !hasScannedRef.current) {
            hasScannedRef.current = true;
            onScanSuccess(code.data);
            return;
          }
        } catch (e) {
          console.error('QR 解码异常:', String(e));
        }
      }
    }

    animationRef.current = requestAnimationFrame(scanLoop);
  }, []);

  const onScanSuccess = (content: string) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    const savedItem = saveHistory({
      type: 'qrcode',
      content,
      shareText: buildShareText({ type: 'qrcode', content }),
    });

    setScanResult(savedItem);
    setIsScanning(false);
    toast.success('扫码成功');
  };

  const handleCopy = async () => {
    if (!scanResult) return;
    try {
      await navigator.clipboard.writeText(scanResult.shareText);
      toast.success('已复制，可粘贴到微信/短信');
    } catch (e) {
      console.error('复制失败:', String(e));
      toast.error('复制失败，请手动复制');
    }
  };

  const handleViewDetail = () => {
    if (!scanResult) return;
    navigate(`/result/${scanResult.id}`);
  };

  const handleResume = () => {
    setScanResult(null);
    setIsScanning(true);
    hasScannedRef.current = false;
    if (isCameraOn) {
      scanLoop();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isScanning && !isCameraOn) {
        startCamera();
      } else if (document.visibilityState === 'hidden') {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isCameraOn, isScanning, startCamera, stopCamera]);

  return (
    <div className="relative flex h-full min-h-[calc(100vh-4rem)] flex-col bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="relative h-64 w-64">
          <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-primary" />
          <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-primary" />
          <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary" />
          <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary" />

          {isScanning && isCameraOn && (
            <div
              className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_12px_var(--primary)]"
              style={{
                animation: 'scanLine 2s ease-in-out infinite',
              }}
            />
          )}
        </div>

        <p className="mt-6 text-sm text-white/70">将二维码放入框内，自动扫描</p>
      </div>

      {cameraError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-sm rounded-xl border border-border/40 bg-card p-6 text-center">
            <Camera className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">{cameraError}</p>
            <button
              onClick={startCamera}
              className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {scanResult && (
        <div className="absolute inset-x-0 bottom-0 z-30 p-4 pb-6">
          <div className="rounded-xl border border-border/40 bg-card/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">扫码结果</span>
              <button
                onClick={handleResume}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 rounded-lg bg-muted/60 p-3">
              <p className="break-all text-sm font-mono text-foreground">
                {scanResult.content}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
              >
                <Copy className="h-4 w-4" />
                复制
              </button>
              <button
                onClick={handleViewDetail}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 font-medium text-secondary-foreground"
              >
                详情
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
