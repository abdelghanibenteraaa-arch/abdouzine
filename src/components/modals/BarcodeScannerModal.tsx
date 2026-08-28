import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertTriangle, CheckCircle2, SwitchCamera, Zap } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'قارئ الباركود عبر كاميرا الهاتف والويب كام',
}) => {
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isBeeping, setIsBeeping] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'barcode-camera-reader-viewport';

  // Sound beep on successful scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1.2 kHz crisp POS beep
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio Context beep not supported:', e);
    }
  };

  // Enumerate cameras
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setErrorMessage('');
    setLastScannedCode(null);

    Html5Qrcode.getCameras()
      .then(devices => {
        if (!mounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment facing camera on phones
          const backCam = devices.find(d => 
            d.label.toLowerCase().includes('back') || 
            d.label.toLowerCase().includes('rear') || 
            d.label.toLowerCase().includes('environment') ||
            d.label.toLowerCase().includes('خلف')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setErrorMessage('لم يتم العثور على أي كاميرا متصلة بالجهاز.');
        }
      })
      .catch(err => {
        if (!mounted) return;
        console.error('Camera enumeration error:', err);
        setErrorMessage('تعذر الوصول إلى الكاميرا. يرجى التأكد من إعطاء صلاحية الكاميرا (Camera Permission) في المتصفح.');
      });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  // Start / Stop Scanner
  useEffect(() => {
    if (!isOpen || !selectedCameraId) return;

    const html5QrCode = new Html5Qrcode(readerElementId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
      ],
      verbose: false,
    });

    scannerRef.current = html5QrCode;

    const config = {
      fps: 15,
      qrbox: { width: 280, height: 180 },
      aspectRatio: 1.333334,
    };

    html5QrCode
      .start(
        selectedCameraId,
        config,
        (decodedText) => {
          // Success Callback
          playBeep();
          setIsBeeping(true);
          setLastScannedCode(decodedText);
          setTimeout(() => setIsBeeping(false), 300);

          onScan(decodedText);
        },
        (errorMessage) => {
          // Frame error (scanning frame with no code) - ignored
        }
      )
      .then(() => {
        setIsScanning(true);
        // Check torch capability if available
        try {
          const track = (html5QrCode as any).getRunningTrackCapabilities?.();
          if (track && track.torch) {
            setHasTorch(true);
          }
        } catch (e) {
          // ignore
        }
      })
      .catch((err) => {
        console.error('Failed to start scanner:', err);
        setErrorMessage('فشل في تشغيل الكاميرا المحددة. يرجى تجربة كاميرا أخرى أو إعادة فتح النافذة.');
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => {
            html5QrCode.clear();
          })
          .catch((err) => {
            console.error('Error stopping scanner:', err);
          });
      } else {
        html5QrCode.clear();
      }
    };
  }, [isOpen, selectedCameraId, onScan]);

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-[#1e2023] border border-neutral-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d2f33] to-[#1a1b1d] px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[10px] text-neutral-400">امسح كود باركود السلعة عبر كاميرا الهاتف مباشرة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-4 flex flex-col items-center justify-center bg-black/60 relative min-h-[300px]">
          
          {/* Target Framing Overlay */}
          <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-xl overflow-hidden bg-black border-2 border-neutral-800 shadow-inner flex items-center justify-center">
            
            <div id={readerElementId} className="w-full h-full object-cover"></div>

            {/* Reticle / Laser Scanning Visual */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Corner brackets */}
              <div className="w-64 h-36 border-2 border-red-500/80 rounded-lg relative flex items-center justify-center shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>

                {/* Laser animation bar */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
              </div>

              <span className="text-[11px] font-bold text-white/80 mt-2 bg-black/60 px-3 py-0.5 rounded-full border border-white/10">
                ضع الباركود داخل الإطار الأحمر
              </span>
            </div>

            {/* Beep / Success Flash */}
            {isBeeping && (
              <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-2xs flex items-center justify-center animate-in fade-in duration-100">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
              </div>
            )}
          </div>

          {/* Last Scanned Tag */}
          {lastScannedCode && (
            <div className="mt-3 w-full bg-emerald-950/80 border border-emerald-600/60 rounded-xl p-2.5 flex items-center justify-between text-xs animate-in zoom-in-95">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-200 font-medium">تمت القراءة بنجاح:</span>
              </div>
              <span className="font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded text-sm tracking-wider">
                {lastScannedCode}
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 w-full bg-red-950/80 border border-red-700 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200 animate-in slide-in-from-top-1">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-3 bg-[#17181b] border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Camera Selection */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <select
              value={selectedCameraId}
              onChange={e => setSelectedCameraId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold focus:outline-none focus:border-red-500"
            >
              {cameras.length === 0 && <option value="">جاري البحث عن الكاميرات...</option>}
              {cameras.map(cam => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `كاميرا #${cam.id.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Switch Camera Button for multi-cam phones */}
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                title="تبديل الكاميرا (الأمامية / الخلفية)"
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold flex items-center gap-1 transition-colors"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تبديل</span>
              </button>
            )}

            {/* Torch Flash Toggle */}
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                title="تشغيل / إطفاء الفلاش"
                className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                  torchOn ? 'bg-amber-500 text-black' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">الفلاش</span>
              </button>
            )}

            {/* Done / Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black transition-colors cursor-pointer shadow-xs"
            >
              إتمام
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
