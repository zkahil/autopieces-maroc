// prisma/seed.ts

import { PrismaClient, Role, MovementType, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { fetchRealPartPhoto } from '@/lib/images';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // ============================================
  // 1. CRÉER LES UTILISATEURS
  // ============================================
  console.log('👤 Création des utilisateurs...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    { name: 'Admin', email: 'admin@example.com', role: Role.ADMIN },
    { name: 'Manager', email: 'manager@example.com', role: Role.MANAGER },
    { name: 'Vendeur', email: 'vendeur@example.com', role: Role.VENDEUR },
    { name: 'Magasinier', email: 'magasinier@example.com', role: Role.MAGASINIER },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        active: true,
      },
    });
  }
  console.log(`✅ ${users.length} utilisateurs créés`);

  // ============================================
  // 2. CRÉER LES MARQUES (CarBrand)
  // ============================================
  console.log('🏭 Création des marques...');
  
  const brandData = [
    { name: 'Toyota', logoUrl: 'https://logo.clearbit.com/toyota.com' },
    { name: 'Honda', logoUrl: 'https://logo.clearbit.com/honda.com' },
    { name: 'BMW', logoUrl: 'https://logo.clearbit.com/bmw.com' },
    { name: 'Mercedes', logoUrl: 'https://logo.clearbit.com/mercedes-benz.com' },
    { name: 'Audi', logoUrl: 'https://logo.clearbit.com/audi.com' },
    { name: 'Volkswagen', logoUrl: 'https://logo.clearbit.com/vw.com' },
    { name: 'Ford', logoUrl: 'https://logo.clearbit.com/ford.com' },
    { name: 'Renault', logoUrl: 'https://logo.clearbit.com/renault.com' },
    { name: 'Peugeot', logoUrl: 'https://logo.clearbit.com/peugeot.com' },
    { name: 'Citroën', logoUrl: 'https://logo.clearbit.com/citroen.com' },
  ];

  const brands = await Promise.all(
    brandData.map(async (data) => {
      return await prisma.carBrand.upsert({
        where: { name: data.name },
        update: {},
        create: data,
      });
    })
  );
  console.log(`✅ ${brands.length} marques créées`);

  // ============================================
  // 3. CRÉER LES CATÉGORIES
  // ============================================
  console.log('📂 Création des catégories...');
  
  const categoryNames = ['Mécanique', 'Électrique', 'Carrosserie', 'Filtration', 'Freinage', 'Moteur', 'Transmission'];
  
  const categories = await Promise.all(
    categoryNames.map(async (name) => {
      return await prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    })
  );
  console.log(`✅ ${categories.length} catégories créées`);

  // ============================================
  // 4. CRÉER LES FOURNISSEURS (Supplier)
  // ============================================
  console.log('🏪 Création des fournisseurs...');
  
  const supplierData = [
    { name: 'AutoPièces Maroc', phone: '05 22 11 22 33', email: 'contact@autopieces.ma', city: 'Casablanca' },
    { name: 'MécaPlus', phone: '05 37 44 55 66', email: 'info@mecaplus.ma', city: 'Rabat' },
    { name: 'Pièces Express', phone: '05 28 77 88 99', email: 'contact@piecesexpress.ma', city: 'Tanger' },
    { name: 'EuroPièces', phone: '05 39 33 44 55', email: 'info@europieces.ma', city: 'Marrakech' },
  ];

  const suppliers = await Promise.all(
    supplierData.map(async (data) => {
      return await prisma.supplier.create({
        data,
      });
    })
  );
  console.log(`✅ ${suppliers.length} fournisseurs créés`);

  // ============================================
  // 5. CRÉER LES PIÈCES (Part)
  // ============================================
  console.log('🔧 Création des pièces...');
  
  const partData = [
    { name: 'Moteur complet', purchasePrice: 1200, salePrice: 1500 },
    { name: 'Transmission automatique', purchasePrice: 800, salePrice: 1000 },
    { name: 'Kit de freins', purchasePrice: 150, salePrice: 220 },
    { name: 'Amortisseur avant', purchasePrice: 90, salePrice: 130 },
    { name: 'Alternateur 12V', purchasePrice: 120, salePrice: 180 },
    { name: 'Batterie 60Ah', purchasePrice: 80, salePrice: 120 },
    { name: 'Pneu été 205/55R16', purchasePrice: 60, salePrice: 95 },
    { name: 'Filtre à huile', purchasePrice: 12, salePrice: 25 },
    { name: 'Plaquettes de frein', purchasePrice: 35, salePrice: 60 },
    { name: 'Courroie distribution', purchasePrice: 45, salePrice: 75 },
    { name: 'Embrayage complet', purchasePrice: 180, salePrice: 250 },
    { name: 'Radiateur aluminium', purchasePrice: 150, salePrice: 210 },
    { name: 'Pompe à eau', purchasePrice: 55, salePrice: 85 },
    { name: 'Thermostat', purchasePrice: 20, salePrice: 35 },
    { name: 'Bougie d\'allumage', purchasePrice: 8, salePrice: 15 },
    { name: 'Filtre à air', purchasePrice: 15, salePrice: 28 },
    { name: 'Capteur ABS', purchasePrice: 40, salePrice: 65 },
    { name: 'Volant moteur', purchasePrice: 200, salePrice: 280 },
  ];

  for (let i = 0; i < partData.length; i++) {
    const data = partData[i];
    const ref = `P${String(i + 1).padStart(4, '0')}`;
    const quantity = Math.floor(Math.random() * 50) + 5;
    const minQuantity = Math.floor(Math.random() * 10) + 3;
    
    // Sélection aléatoire
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    
    // Récupérer l'image
    let imageUrl = '/placeholder-parts.jpg';
    try {
      console.log(`📸 Récupération de l'image pour: ${data.name}`);
      imageUrl = await fetchRealPartPhoto({
        partName: data.name,
        brand: randomBrand.name,
      });
    } catch (error) {
      console.warn(`⚠️ Utilisation du placeholder pour ${data.name}`);
      imageUrl = `https://picsum.photos/seed/${encodeURIComponent(data.name)}/400/400`;
    }

    // ✅ Création de la pièce avec les relations
    const part = await prisma.part.create({
      data: {
        reference: ref,
        name: data.name,
        description: `${data.name} pour automobile ${randomBrand.name}`,
        imageUrl: imageUrl,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        quantity: quantity,
        minQuantity: minQuantity,
        // ✅ Relations
        brandId: randomBrand.id,
        categoryId: randomCategory.id,
        supplierId: randomSupplier.id,
      },
    });

    console.log(`✅ Pièce créée: ${part.name} (${part.reference}) - ${randomBrand.name}`);
  }

  console.log(`✅ ${partData.length} pièces créées`);

  // ============================================
  // 6. CRÉER DES CLIENTS
  // ============================================
  console.log('👥 Création des clients...');
  
  const clientData = [
    { name: 'Garage AutoPlus', phone: '05 22 11 22 33', email: 'contact@autoplus.ma', ice: '123456789', address: '123 Rue de Paris', city: 'Casablanca' },
    { name: 'Mécanique Express', phone: '05 37 44 55 66', email: 'info@mecanique.ma', ice: '987654321', address: '45 Avenue Hassan II', city: 'Rabat' },
    { name: 'Garage du Centre', phone: '05 28 77 88 99', email: 'contact@garagecentre.ma', ice: '456789123', address: '78 Rue Mohammed V', city: 'Tanger' },
    { name: 'Auto Service Pro', phone: '05 39 33 44 55', email: 'info@autoservice.ma', ice: '789123456', address: '12 Boulevard Moulay Youssef', city: 'Marrakech' },
  ];

  const clients = await Promise.all(
    clientData.map(async (data) => {
      return await prisma.client.create({
        data,
      });
    })
  );
  console.log(`✅ ${clients.length} clients créés`);

  // ============================================
  // 7. CRÉER UNE FACTURE
  // ============================================
  console.log('📄 Création d\'une facture...');
  
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });
  
  const client = clients[0];
  const parts = await prisma.part.findMany({ take: 3 });
  
  if (adminUser && client && parts.length > 0) {
    const invoiceNumber = `FACT-${Date.now()}`;
    
    // Calculer les totaux
    const lines = parts.map((part, index) => ({
      partId: part.id,
      quantity: index + 1,
      unitPrice: part.salePrice,
      total: part.salePrice * (index + 1),
    }));
    
    const totalHT = lines.reduce((sum, line) => sum + line.total, 0);
    const tva = 20;
    const totalTTC = totalHT * (1 + tva / 100);
    
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        clientId: client.id,
        userId: adminUser.id,
        status: InvoiceStatus.VALIDEE,
        totalHT: totalHT,
        tva: tva,
        totalTTC: totalTTC,
        lines: {
          create: lines,
        },
      },
    });
    
    console.log(`✅ Facture créée: ${invoice.number} - ${totalTTC} DH`);
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