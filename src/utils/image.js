/**
 * Procesa una imagen subida por el usuario antes de guardarla.
 *
 * - Recorta al centro para conseguir una cara cuadrada.
 * - Redimensiona a `size` × `size` píxeles.
 * - Codifica como JPEG con la calidad indicada.
 *
 * El resultado es un data URL que cabe sin problemas en un documento
 * de Firestore (típicamente 15-40 KB para 240×240 a calidad 0.85).
 */
export function fileToResizedDataUrl(file, size = 240, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Recorte cuadrado centrado
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen.'));
    };
    img.src = url;
  });
}
