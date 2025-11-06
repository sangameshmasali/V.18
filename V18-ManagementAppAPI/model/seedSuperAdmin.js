const mongoose = require("mongoose");
const SuperAdmin = require("./superAdmin");

const MOCK_ADMINS = [
  { 
    name: "Sarah Johnson", 
    email: "admin@v18tuition.com", 
    password: "admin123", 
    role: "super_admin"
  },
  { 
    name: "Michael Chen", 
    email: "michael@v18tuition.com", 
    password: "admin123", 
    role: "super_admin"
  },
  { 
    name: "Emily Davis", 
    email: "emily@v18tuition.com", 
    password: "admin123", 
    role: "super_admin"
  },
];

mongoose.connect("mongodb+srv://prasanna2210006_db_user:xr4RQVIVx3eoeCJT@v18adminapp.bdexfpp.mongodb.net/v18adminapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("✅ Connected to MongoDB");

  for (const admin of MOCK_ADMINS) {
    const exists = await SuperAdmin.findOne({ email: admin.email });
    if (!exists) {
      await SuperAdmin.create(admin);
      console.log(`✅ Created admin: ${admin.email}`);
    } else {
      console.log(`⚠️ Already exists: ${admin.email}`);
    }
  }

  mongoose.disconnect();
})
.catch(err => {
  console.error("❌ Error:", err);
  mongoose.disconnect();
});
