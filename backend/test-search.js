import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testUser = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: { type: String, select: false }
  }));

  const user = await User.create({
    name: 'Zero Order Test',
    email: 'zero.order@example.com',
    phone: '1111111111',
    password: 'password123'
  });

  console.log('Created user:', user._id);

  // Search by name
  const resName = await User.find({ name: /Zero Order/i });
  console.log('Found by name:', resName.length);

  // Search by phone
  const resPhone = await User.find({ phone: /11111/i });
  console.log('Found by phone:', resPhone.length);

  await User.findByIdAndDelete(user._id);
  console.log('Cleaned up');
  process.exit(0);
}

testUser().catch(console.error);
