require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Models
const Teacher = require("./model/teachers");
const Student = require("./model/students");
const Branch = require("./model/branches");
const ActivityLog = require("./model/activityLogs");
const BranchAdmin = require("./model/branchAdmin");
const Receipt = require("./model/receipt");
const SuperAdmin = require("./model/superAdmin");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://v18adminapi.vercel.app",
    "https://v-18-admin.vercel.app",
    "https://admin.v18premiumtuition.com",
    "https://v18adminapi.vercel.app",
    "https://v18-management-frontend.vercel.app", // Update this with your actual frontend URL when deployed
  ],
  credentials: true,
}));
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(
    process.env.DBConnection,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Encryption helpers
const SECRET_KEY = crypto.createHash("sha256").update("v18-branch-secret").digest(); // 32 bytes
const ALGORITHM = "aes-256-cbc";

function encrypt(text) {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(payload) {
  if (!payload || !payload.includes(":")) return "";
  const [ivHex, dataHex] = payload.split(":");
  try {
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(dataHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("❌ Password decrypt error:", err.message);
    return "";
  }
}

//

// Root route to check if API is working
app.get('/', (req, res) => {
    res.json( "message: "+ "Welcome to V18 Management App API! The server is running successfully." );
});

//
// ------------------ Super Admin Login ------------------
app.post("/api/superadmins/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await SuperAdmin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    console.error("SuperAdmin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ Students ------------------
app.get("/api/students", async (_req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = new Student({
      ...req.body,
      registrationDate: new Date(),
    });
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------ Receipts ------------------
app.get("/api/receipts", async (_req, res) => {
  try {
    const receipts = await Receipt.find();
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

app.post("/api/receipts", async (req, res) => {
  try {
    const receipt = new Receipt(req.body);
    await receipt.save();
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: "Failed to create receipt" });
  }
});

// ------------------ Teachers ------------------
app.get("/api/teachers", async (_req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/teachers", async (req, res) => {
  try {
    const teacher = new Teacher({
      ...req.body,
      joinDate: new Date(),
    });
    await teacher.save();
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/teachers/:id", async (req, res) => {
  try {
    await Teacher.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Teacher updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------ Branch Admins ------------------
app.post("/api/branchadmins/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await BranchAdmin.findOne({ email });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) return res.status(401).json({ error: "Invalid credentials" });

    const { passwordHash, passwordEncrypted, ...safe } = admin.toObject();
    res.json(safe);
  } catch (err) {
    console.error("Branch admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ Branches ------------------
app.get("/api/branches", async (_req, res) => {
  try {
    const branches = await Branch.find();

    const data = await Promise.all(
      branches.map(async (branch) => {
        const branchObj = branch.toObject();
        const admin = await BranchAdmin.findOne({ branchId: branch._id.toString() });

        if (admin) {
          branchObj.admin = {
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            password: decrypt(admin.passwordEncrypted),
          };
        }

        return branchObj;
      })
    );

    res.json(data);
  } catch (err) {
    console.error("Fetch branches error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/branches/:id", async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ error: "Branch not found" });

    const branchObj = branch.toObject();
    const admin = await BranchAdmin.findOne({ branchId: branch._id.toString() });

    if (admin) {
      branchObj.admin = {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        password: decrypt(admin.passwordEncrypted),
      };
    }

    res.json(branchObj);
  } catch (err) {
    console.error("Fetch branch error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/branches", async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      manager,
      capacity,
      currentStudents,
      status,
      establishedDate,
      admin,
    } = req.body;

    const branch = new Branch({
      name,
      address,
      phone,
      manager,
      capacity,
      currentStudents,
      status,
      establishedDate,
      admin: admin
        ? {
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
          }
        : undefined,
    });

    await branch.save();

    if (admin?.email && admin?.password) {
      const passwordHash = await bcrypt.hash(admin.password, 10);
      const passwordEncrypted = encrypt(admin.password);

      await BranchAdmin.findOneAndUpdate(
        { branchId: branch._id.toString() },
        {
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          passwordHash,
          passwordEncrypted,
          role: "branch_admin",
          branchId: branch._id.toString(),
          branchName: branch.name,
        },
        { upsert: true, new: true }
      );
    }

    res.json(branch);
  } catch (err) {
    console.error("Create branch error:", err);
    res.status(400).json({ error: err.message });
  }
});

app.put("/api/branches/:id", async (req, res) => {
  try {
    const branchId = req.params.id;
    const { admin: adminUpdates, ...branchUpdates } = req.body;

    const branch = await Branch.findByIdAndUpdate(
      branchId,
      {
        ...branchUpdates,
        admin: adminUpdates
          ? {
              name: adminUpdates.name,
              email: adminUpdates.email,
              phone: adminUpdates.phone,
            }
          : branchUpdates.admin,
      },
      { new: true }
    );

    if (adminUpdates) {
      const payload = {
        name: adminUpdates.name,
        email: adminUpdates.email,
        phone: adminUpdates.phone,
      };

      if (adminUpdates.password) {
        payload.passwordHash = await bcrypt.hash(adminUpdates.password, 10);
        payload.passwordEncrypted = encrypt(adminUpdates.password);
      }

      await BranchAdmin.findOneAndUpdate(
        { branchId },
        {
          $set: {
            ...payload,
            role: "branch_admin",
            branchId,
            branchName: branch?.name ?? adminUpdates.branchName,
          },
        },
        { new: true, upsert: true }
      );
    }

    res.json({ message: "Branch and admin updated successfully", branch });
  } catch (err) {
    console.error("Update branch error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ------------------ Activity Logs ------------------
app.get("/api/logs", async (_req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/logs", async (req, res) => {
  try {
    const log = new ActivityLog({
      ...req.body,
      timestamp: new Date(),
    });
    await log.save();

    const count = await ActivityLog.countDocuments();
    if (count > 100) {
      const extra = await ActivityLog.find().sort({ createdAt: 1 }).limit(count - 100);
      const ids = extra.map((l) => l._id);
      await ActivityLog.deleteMany({ _id: { $in: ids } });
    }

    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ------------------ Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});