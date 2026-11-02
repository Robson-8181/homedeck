import { useMemo } from "react";
import qrcode from "qrcode-generator";

/** A QR code drawn as one SVG path, so it stays sharp at any size and follows currentColor. */
export function QrCode({ label, value }: { label: string; value: string }) {
  const { path, size } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let d = "";
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) if (qr.isDark(row, col)) d += `M${col + 2} ${row + 2}h1v1h-1z`;
    }
    return { path: d, size: count + 4 };
  }, [value]);
  return <svg aria-label={label} className="hd-qr" role="img" shapeRendering="crispEdges" viewBox={`0 0 ${size} ${size}`}>
    <rect fill="#fff" height={size} width={size} />
    <path d={path} fill="#111" />
  </svg>;
}
