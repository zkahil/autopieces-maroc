// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { fetchRealPartPhoto } from '@/lib/images'; // ✅ Import correct

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Données de test
  const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Renault'];
  const partNames = [
    'Moteur', 'Transmission', 'Freins', 'Amortisseur', 
    'Alternateur', 'Batterie', 'Pneu', 'Filtre à huile',
    'Plaquettes de frein', 'Courroie distribution', 'Embrayage', 'Radiateur'
  ];

  console.log('🌱 Création des pièces...');

  for (let i = 0; i < partNames.length; i++) {
    const ref = `P${String(i + 1).padStart(4, '0')}`;
    const price = Math.round((50 + Math.random() * 900) * 10) / 10;
    const stock = Math.floor(Math.random() * 50) + 1;
    
    // ✅ Appel avec gestion d'erreur
    let imageUrl = '/placeholder-parts.jpg';
    try {
      console.log(`📸 Récupération de l'image pour: ${partNames[i]}`);
      imageUrl = await fetchRealPartPhoto({
        partName: partNames[i],
        brand: brands[Math.floor(Math.random() * brands.length)],
      });
    } catch (error) {
      console.warn(`⚠️ Erreur pour ${partNames[i]}, utilisation du placeholder`);
      imageUrl = `https://picsum.photos/seed/${encodeURIComponent(partNames[i])}/400/400`;
    }

    // Créer la pièce
    const part = await prisma.part.create({
      data: {
        reference: ref,
        name: partNames[i],
        description: `${partNames[i]} pour automobile`,
        price: price,
        stock: stock,
        brand: brands[Math.floor(Math.random() * brands.length)],
        image: imageUrl,
        category: ['Mécanique', 'Électrique', 'Carrosserie', 'Filtration'][Math.floor(Math.random() * 4)],
      },
    });

    console.log(`✅ Pièce créée: ${part.name} (${part.reference})`);
  }

  console.log('✅ Seed terminé avec succès !');
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });