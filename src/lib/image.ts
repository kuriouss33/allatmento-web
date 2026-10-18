/**
 * Terepi fotók tömörítése és hálózati ellenőrzés
 * 
 * Mobilos terepviszonyok között a kamerák által készített 10-25 MB-os fotókat
 * a telefon memóriájában azonnal 150-350 KB méretűre tömöríti.
 * Ez biztosítja, hogy gyenge térerő vagy IndexedDB offline mentés esetén is
 * villámgyors és megbízható legyen a feltöltés.
 */

export async function compressImage(
  fileOrBlob: File | Blob, 
  maxDimension: number = 1280, 
  quality: number = 0.78
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Nem sikerült létrehozni a Canvas környezetet.'));
        return;
      }

      // Képmegjelenítés simítással
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('A kép tömörítése sikertelen volt.'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = (err) => reject(err);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Hálózati hiba detektálása (pl. nincs internetkapcsolat, DNS hiba, timeout)
 */
export function isNetworkError(err: any): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  if (!err) return false;

  const msg = (err.message || err.toString() || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network error') ||
    msg.includes('networkerror') ||
    msg.includes('offline') ||
    msg.includes('internet') ||
    msg.includes('net::err_internet_disconnected') ||
    msg.includes('connection refused') ||
    msg.includes('timeout') ||
    msg.includes('hálózati hiba') ||
    msg.includes('szerver hiba (50') ||
    msg.includes('nem sikerült csatlakozni')
  );
}
