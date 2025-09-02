const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { CustomUserModel } = require('./model/CustomUserModel');
const { HoldingsModel } = require('./model/HoldingsModel');
const { OrdersModel } = require('./model/OrdersModel');
const { PositionsModel } = require('./model/PositionsModel');
const { WatchlistModel } = require('./model/WatchlistModel');

async function cleanupDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully');
    console.log('🗑️  Starting database cleanup...\n');

    // Get counts before deletion
    const userCount = await CustomUserModel.countDocuments();
    const holdingsCount = await HoldingsModel.countDocuments();
    const ordersCount = await OrdersModel.countDocuments();
    const positionsCount = await PositionsModel.countDocuments();
    const watchlistCount = await WatchlistModel.countDocuments();

    console.log('📊 Current database state:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Holdings: ${holdingsCount}`);
    console.log(`   Orders: ${ordersCount}`);
    console.log(`   Positions: ${positionsCount}`);
    console.log(`   Watchlist items: ${watchlistCount}\n`);

    if (userCount === 0) {
      console.log('✅ Database is already clean - no users to delete');
      return;
    }

    // Confirm deletion
    console.log('⚠️  WARNING: This will permanently delete ALL user data!');
    console.log('   This includes:');
    console.log('   - All user accounts');
    console.log('   - All holdings data');
    console.log('   - All trading orders');
    console.log('   - All positions');
    console.log('   - All watchlist items');
    console.log('   - All sessions\n');

    // Delete all user-related data
    console.log('🗑️  Deleting user data...');
    
    const deletionResults = await Promise.all([
      CustomUserModel.deleteMany({}),
      HoldingsModel.deleteMany({}),
      OrdersModel.deleteMany({}),
      PositionsModel.deleteMany({}),
      WatchlistModel.deleteMany({})
    ]);

    console.log('✅ Deletion completed:');
    console.log(`   Users deleted: ${deletionResults[0].deletedCount}`);
    console.log(`   Holdings deleted: ${deletionResults[1].deletedCount}`);
    console.log(`   Orders deleted: ${deletionResults[2].deletedCount}`);
    console.log(`   Positions deleted: ${deletionResults[3].deletedCount}`);
    console.log(`   Watchlist items deleted: ${deletionResults[4].deletedCount}`);

    // Clear sessions collection
    try {
      const sessionsCollection = mongoose.connection.db.collection('sessions');
      const sessionResult = await sessionsCollection.deleteMany({});
      console.log(`   Sessions deleted: ${sessionResult.deletedCount}`);
    } catch (sessionError) {
      console.log('   Sessions: Collection not found or already empty');
    }

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('✅ All user data has been removed');
    console.log('✅ Database structure preserved');
    console.log('✅ Ready for fresh user registrations\n');

    // Verify cleanup
    const finalUserCount = await CustomUserModel.countDocuments();
    if (finalUserCount === 0) {
      console.log('✅ Verification: Database is now clean');
    } else {
      console.log('❌ Warning: Some users may still exist');
    }

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  console.log('🧹 Hytrade 4 Database Cleanup Tool');
  console.log('=====================================\n');
  
  cleanupDatabase().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { cleanupDatabase };
