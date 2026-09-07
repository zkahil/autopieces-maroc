// src/lib/images.ts
interface ImageParams {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export function getImageUrl(url: string, params: ImageParams = {}): string {
  try {
    // Vérifier que l'URL est valide
    if (!url || typeof url !== 'string') {
      console.warn('Invalid image URL:', url);
      return '/placeholder-image.jpg';
    }

    // Nettoyer les paramètres
    const cleanParams: Record<string, string> = {};
    
    if (params.width && params.width > 0) {
      cleanParams.width = params.width.toString();
    }
    if (params.height && params.height > 0) {
      cleanParams.height = params.height.toString();
    }
    if (params.fit) {
      cleanParams.fit = params.fit;
    }
    if (params.quality && params.quality > 0 && params.quality <= 100) {
      cleanParams.quality = params.quality.toString();
    }
    if (params.format) {
      cleanParams.format = params.format;
    }

    // Construire l'URL avec les paramètres
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || '';
    if (baseUrl) {
      const searchParams = new URLSearchParams(cleanParams);
      return `${baseUrl}${url}?${searchParams.toString()}`;
    }

    // Fallback: retourner l'URL sans traitement
    return url;

  } catch (error) {
    console.error('Error building image URL:', error);
    return url || '/placeholder-image.jpg';
  }
}