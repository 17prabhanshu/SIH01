const bcrypt = require('bcryptjs');

const hash = "$2b$10$tm7r4xOTcW4vohtcf2CuZOZsW2kK1yUO9UBZzmuYvva3kUAi7hiBm";
const words = ['password', 'admin', 'admin123', 'change-this-password', 'test', '123456', '12345678'];

async function check() {
  for (const w of words) {
    if (await bcrypt.compare(w, hash)) {
      console.log(`Matched! Password is: ${w}`);
      return;
    }
  }
  console.log("No match found in common passwords.");
}
check();
