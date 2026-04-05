import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: { name: 'SELLER' },
  });

  const operationsRole = await prisma.role.upsert({
    where: { name: 'OPERATIONS' },
    update: {},
    create: { name: 'OPERATIONS' },
  });

  console.log('Roles created');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salessystem.cl' },
    update: {},
    create: {
      email: 'admin@salessystem.cl',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      roleId: adminRole.id,
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'vendedor@salessystem.cl' },
    update: {},
    create: {
      email: 'vendedor@salessystem.cl',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      roleId: sellerRole.id,
    },
  });

  const operationsUser = await prisma.user.upsert({
    where: { email: 'operaciones@salessystem.cl' },
    update: {},
    create: {
      email: 'operaciones@salessystem.cl',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'García',
      roleId: operationsRole.id,
    },
  });

  console.log('Users created');

  const products = [
    {
      name: 'Torta de Chocolate',
      category: 'TORTA' as any,
      description: 'Deliciosa torta de chocolate con capas de crema y ganache',
      basePrice: 25000,
    },
    {
      name: 'Torta de Vainilla',
      category: 'TORTA' as any,
      description: 'Clásica torta de vainilla con crema de mantequilla',
      basePrice: 22000,
    },
    {
      name: 'Torta Red Velvet',
      category: 'TORTA' as any,
      description: 'Torta roja con queso crema y glaseado',
      basePrice: 28000,
    },
    {
      name: 'Cupcakes (docena)',
      category: 'BANQUETERIA_DULCE' as any,
      description: 'Docena de cupcakes variados',
      basePrice: 18000,
    },
    {
      name: 'Galletas Decoradas (docena)',
      category: 'BANQUETERIA_DULCE' as any,
      description: 'Galletas personalizadas para eventos',
      basePrice: 15000,
    },
    {
      name: 'Brownies (docena)',
      category: 'BANQUETERIA_DULCE' as any,
      description: 'Brownies de chocolate con nueces',
      basePrice: 12000,
    },
    {
      name: 'Canapés Salados (docena)',
      category: 'BANQUETERIA_SALADA' as any,
      description: 'Selección de canapés mixtos',
      basePrice: 20000,
    },
    {
      name: 'Mini Empanadas (docena)',
      category: 'BANQUETERIA_SALADA' as any,
      description: 'Empanadas de pino y quesería',
      basePrice: 16000,
    },
    {
      name: 'Tabla de Quesos',
      category: 'BANQUETERIA_SALADA' as any,
      description: 'Tabla con variedad de quesos y frutos secos',
      basePrice: 35000,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: {
        ...product,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });
  }

  console.log('Products created');

  const client = await prisma.client.upsert({
    where: { rut: '12345678-9' },
    update: {},
    create: {
      firstName: 'Cliente',
      lastName: 'Ejemplo',
      businessName: 'Empresa Ejemplo SpA',
      rut: '12345678-9',
      phone: '+56912345678',
      email: 'cliente@ejemplo.cl',
      address: 'Av. Principal 123, Santiago',
      createdById: adminUser.id,
      updatedById: adminUser.id,
    },
  });

  console.log('Client created');

  console.log('Seed completed successfully!');
  console.log('Default credentials:');
  console.log('  Admin: admin@salessystem.cl / admin123');
  console.log('  Seller: vendedor@salessystem.cl / admin123');
  console.log('  Operations: operaciones@salessystem.cl / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });