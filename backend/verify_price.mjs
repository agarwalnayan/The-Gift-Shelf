/**
 * Verification script — reads real product data and simulates the
 * createManualOrder item construction. No writes, no modifications.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const PRODUCT_SCHEMA = new mongoose.Schema({
  name: String,
  price: Number,
  images: [{ url: String, public_id: String }],
  variants: [{ sku: String, name: String, price: Number, stock: Number, isActive: Boolean }],
  customizationOptions: [{ key: String, label: String, type: String, isEnabled: Boolean, choices: [String], additionalPrice: Number }],
  isActive: Boolean,
  isDeleted: Boolean,
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', PRODUCT_SCHEMA);

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Find any active, non-deleted product
  const products = await Product.find({ isActive: true, isDeleted: false }).limit(5).lean();

  if (!products.length) {
    console.log('❌ No active products found.');
    return;
  }

  for (const product of products) {
    console.log('═══════════════════════════════════════');
    console.log('PRODUCT:', product.name);
    console.log('  product.price   :', product.price);
    console.log('  product.images  :', JSON.stringify(product.images?.slice(0, 2)));
    console.log('  images[0]?.url  :', product.images?.[0]?.url ?? 'UNDEFINED ← BUG PRE-FIX');

    // Safe fallback (post-fix)
    const itemImage = product.images?.[0]?.url || '';
    console.log('  itemImage (fixed):', itemImage === '' ? '"" (empty string — image: required will fail if we keep "")' : itemImage);

    if (product.variants?.length > 0) {
      console.log('  variants:');
      product.variants.forEach(v => {
        console.log(`    sku=${v.sku} price=${v.price} stock=${v.stock} active=${v.isActive}`);
        // Simulate basePrice for variant
        const basePrice = v.price ?? product.price ?? 0;
        console.log(`    → simulated basePrice for this variant: ${basePrice}`);
      });
    } else {
      const basePrice = product.price ?? 0;
      console.log(`  → simulated basePrice (no variant): ${basePrice}`);
    }

    if (product.customizationOptions?.length > 0) {
      console.log('  customizationOptions:');
      product.customizationOptions.forEach(o => {
        console.log(`    key=${o.key} type=${o.type} choices=${JSON.stringify(o.choices)} additionalPrice=${o.additionalPrice}`);
      });
    }
    console.log();
  }

  // ─── CRITICAL CHECK: Will image: '' pass the required validator? ──────────
  console.log('═══════════════════════════════════════');
  console.log('CRITICAL: Does image: "" pass Mongoose required:true?');
  const testSchema = new mongoose.Schema({ image: { type: String, required: true } }, { _id: false });
  const TestModel = mongoose.model('__test_image', testSchema);
  const doc = new TestModel({ image: '' });
  const err = doc.validateSync();
  if (err) {
    console.log('❌ image: "" FAILS required validation —', err.errors.image?.message);
    console.log('   FIX NEEDED: image fallback must be a non-empty string or schema changed to not required');
  } else {
    console.log('✅ image: "" passes required validation (Mongoose treats non-null empty string as present)');
  }
}

verify().catch(e => { console.error('❌ Error:', e.message); }).finally(() => mongoose.disconnect());
