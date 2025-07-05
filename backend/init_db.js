const { PrismaClient } = require('@prisma/client');

async function initializeDatabase() {
  console.log('🗄️ Initializing ClientScopeAI Database...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Create default settings if none exist
    console.log('⚙️ Checking default settings...');
    const existingSettings = await prisma.appSettings.findFirst();
    
    if (!existingSettings) {
      console.log('📝 Creating default settings...');
      await prisma.appSettings.create({
        data: {
          apifyApiKey: '',
          cookieMode: true,
          cookies: JSON.stringify([]),
        },
      });
      console.log('✅ Default settings created!');
    } else {
      console.log('✅ Settings already exist');
    }

    // Show database stats
    const [leadCount, sessionCount, settingsCount] = await Promise.all([
      prisma.lead.count(),
      prisma.session.count(),
      prisma.appSettings.count(),
    ]);

    console.log('📊 Database Stats:');
    console.log(`   • Leads: ${leadCount}`);
    console.log(`   • Sessions: ${sessionCount}`);
    console.log(`   • Settings: ${settingsCount}`);

    console.log('🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 