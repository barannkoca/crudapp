const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const opps = await db.collection('opportunities').find({'ucretler.0': {$exists: true}}).limit(2).toArray();
  console.log(JSON.stringify(opps.map(o => o.ucretler), null, 2));
  
  const paymentStats = await db.collection('opportunities').aggregate([
      // First, handle empty ucretler
      {
        $project: {
          islem_turu: 1,
          ucretler: { $ifNull: ['$ucretler', []] }
        }
      },
      // Unwind ucretler to process them
      { $unwind: { path: '$ucretler', preserveNullAndEmptyArrays: true } },
      // Group by Opportunity (_id) to get per-opportunity totals
      {
        $group: {
          _id: '$_id',
          islem_turu: { $first: '$islem_turu' },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$ucretler.odeme_durumu', 'toplam_ucret'] }, { $toDouble: '$ucretler.miktar' }, 0]
            }
          },
          receivedAmount: {
            $sum: {
              $cond: [{ $eq: ['$ucretler.odeme_durumu', 'alinan_ucret'] }, { $toDouble: '$ucretler.miktar' }, 0]
            }
          },
          expenseAmount: {
            $sum: {
              $cond: [{ $eq: ['$ucretler.odeme_durumu', 'gider'] }, { $toDouble: '$ucretler.miktar' }, 0]
            }
          }
        }
      },
      // Calculate pending per opportunity
      {
        $addFields: {
          pendingPayment: {
            $cond: [
              { $gt: [{ $subtract: ['$totalRevenue', '$receivedAmount'] }, 0] },
              { $subtract: ['$totalRevenue', '$receivedAmount'] },
              0
            ]
          }
        }
      },
      // Group by islem_turu
      {
        $group: {
          _id: '$islem_turu',
          totalRevenue: { $sum: '$totalRevenue' },
          receivedAmount: { $sum: '$receivedAmount' },
          expenseAmount: { $sum: '$expenseAmount' },
          pendingPayment: { $sum: '$pendingPayment' }
        }
      }
    ]).toArray();
    console.log("Stats:", JSON.stringify(paymentStats, null, 2));
    
  await mongoose.disconnect();
}
run().catch(console.error);
