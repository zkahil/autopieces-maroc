// src/lib/images.ts
// Ajouter cette fonction si elle manque

interface PartPhotoParams {
  brand?: string;
  model?: string;
  partName?: string;
  width?: number;
  height?: number;
}

export async function fetchRealPartPhoto(params: PartPhotoParams): Promise<string> {
  try {
    // Construction de l'URL avec paramètres sécurisés
    const searchParams = new URLSearchParams();
    
    if (params.brand) searchParams.append('brand', params.brand);
    if (params.model) searchParams.append('model', params.model);
    if (params.partName) searchParams.append('part', params.partName);
    if (params.width) searchParams.append('width', params.width.toString());
    if (params.height) searchParams.append('height', params.height.toString());

    const baseUrl = process.env.NEXT_PUBLIC_PHOTO_API_URL || 'https://api.unsplash.com/photos/random';
    
    // Exemple avec Unsplash
    const query = [params.brand, params.model, params.partName].filter(Boolean).join(' ');
    if (query) {
      searchParams.append('query', query);
    }

    const url = `${baseUrl}?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.status}`);
    }

    const data = await response.json();
    return data.urls?.regular || '/placeholder-parts.jpg';

  } catch (error) {
    console.error('Error fetching part photo:', error);
    return '/placeholder-parts.jpg';
  }
}