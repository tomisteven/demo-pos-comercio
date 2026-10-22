import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

const SCANNER_ID = 'barcode-scanner-region';

/**
 * Modal de escaneo de código de barras con la cámara.
 * Al detectar un código, llama a onDetected(code) y se cierra solo.
 *
 * @param {{ onDetected: (code: string) => void, onClose: () => void }} props
 */
export default function BarcodeScannerModal({ onDetected, onClose }) {
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
      ],
      useBarCodeDetectorIfSupported: true,
    });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 260, height: 150 } },
        (decodedText) => {
          if (doneRef.current) return;
          doneRef.current = true;
          onDetected(String(decodedText).trim());
        },
        () => {}
      )
      .then(() => setStarting(false))
      .catch((err) => {
        setStarting(false);
        setError(
          typeof err === 'string'
            ? err
            : 'No se pudo acceder a la cámara. Verificá los permisos del navegador.'
        );
      });

    return () => {
      const s = scannerRef.current;
      if (s && s.isScanning) {
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-2xl border border-stone-700 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-stone-800">
          <h3 className="text-lg font-bold text-textLight flex items-center gap-2">
            <Camera size={18} /> Escanear código
          </h3>
          <button onClick={onClose} className="text-textMuted hover:text-textLight">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div
            id={SCANNER_ID}
            className="w-full rounded-lg overflow-hidden bg-black min-h-[220px] flex items-center justify-center"
          />
          {starting && !error && (
            <p className="text-sm text-textMuted text-center">Iniciando cámara…</p>
          )}
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <p className="text-xs text-textMuted text-center">
            Apuntá la cámara al código de barras. Se carga solo al detectarlo.
          </p>
        </div>
      </div>
    </div>
  );
}
