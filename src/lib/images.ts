// src/lib/images.ts

// ✅ Ajouter l'interface
export interface PartPhotoParams {
  partName: string;
  brand?: string;
  model?: string;
  width?: number;
  height?: number;
}

// ✅ Fonction qui accepte un objet avec partName et brand
export async function fetchRealPartPhoto(
  params: PartPhotoParams
): Promise<string> {
  try {
    // Construire la requête
    const query = [params.brand, params.model, params.partName]
      .filter(Boolean)
      .join(' ');

    // Utiliser une API d'images (Unsplash, Picsum, etc.)
    const baseUrl = process.env.NEXT_PUBLIC_PHOTO_API_URL || 'https://picsum.photos/seed';
    
    // Si on a une API, construire l'URL
    if (process.env.NEXT_PUBLIC_PHOTO_API_URL) {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('query', query);
      if (params.width) searchParams.append('width', params.width.toString());
      if (params.height) searchParams.append('height', params.height.toString());
      
      const url = `${baseUrl}?${searchParams.toString()}`;
      
      // Faire la requête si c'est une API externe
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.urls?.regular || data.url || `/api/placeholder?${searchParams.toString()}`;
      }
    }
    
    // Fallback: utiliser Picsum avec un seed basé sur le nom
    const seed = encodeURIComponent(query || params.partName);
    return `https://picsum.photos/seed/${seed}/400/400`;
    
  } catch (error) {
    console.error('Error fetching part photo:', error);
    // Fallback en cas d'erreur
    return `https://picsum.photos/seed/${encodeURIComponent(params.partName)}/400/400`;
  }
}

// ✅ Version simplifiée pour la compatibilité (accepte string)
export async function fetchPartPhoto(partName: string, brand?: string): Promise<string> {
  return fetchRealPartPhoto({ partName, brand });
}