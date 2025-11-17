// Usage:
//   node scripts/setAdminPassword.js user@example.com
// or
//   EMAIL="user@example.com" node scripts/setAdminPassword.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('../models/User');
const fs = require('fs');
const os = require('os');

function generateEmojiPassword(length = 3) {
  // A small curated set of emoji that display well
  const emojis = [
    '🍷','🍾','🌹','🌸','🌺','🌿','🍇','🍒','✨','💫','🌟','🕯️','🫧','🌙','☕','🍫'
  ];
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += emojis[Math.floor(Math.random() * emojis.length)];
  }
  return pass;
}

async function run() {
  const email = process.env.EMAIL || process.argv[2];
  if (!email) {
    console.error('Please provide an email as argv or EMAIL env var.');
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.error(`User not found for email: ${email}`);
      process.exit(1);
    }

    // Allow providing a specific password via env var or argv[3]
    const provided = process.env.PASSWORD || process.argv[3];
    const newPass = provided || generateEmojiPassword(3);
    user.password = newPass; // will be hashed by pre-save hook
    user.role = 'admin';
    await user.save();

    console.log(`✅ Promoted ${email} to admin and set new emoji password:`);
    console.log(newPass);

    // Save the generated password to a local dotfile (workspace only)
    try {
      const outPath = path.resolve(__dirname, '..', '.last_admin_password');
      fs.writeFileSync(outPath, `${email} ${newPass}${os.EOL}`, { encoding: 'utf8', mode: 0o600 });
    } catch (e) {
      // ignore write errors but log for visibility
      console.error('Warning: failed to write .last_admin_password:', e.message || e);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin password:', err);
    process.exit(1);
  }
}

run();
