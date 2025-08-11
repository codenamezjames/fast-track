# 🔧 FastTrack Port Configuration

## 📋 **Updated Port Assignments**

### **FastTrack Application Ports:**

- **Development Server**: `http://localhost:9000` (Quasar default)
- **Production Server**: `http://localhost:5500` (updated from 5000)
- **PWA Serve**: `http://localhost:5500` (updated from 5000)
- **Test Environment**: `http://localhost:5500` (updated from 5000)

### **Appwrite Backend Ports:**

- **Appwrite API**: `http://localhost:5501` (updated from 80)
- **Appwrite Console**: `http://localhost:5501/console` (updated from localhost/console)
- **Appwrite HTTPS**: `https://localhost:5502` (updated from 443)

---

## 🔄 **Port Changes Made:**

### **1. FastTrack Application (fast-track/)**

**Files Updated:**

- `quasar.config.js`: Production port changed from 5000 → 5500
- `package.json`: PWA serve port changed from 5000 → 5500
- `test/setup.js`: Test environment port changed from 5000 → 5500

### **2. Appwrite Backend (appwrite/)**

**Files Updated:**

- `docker-compose.yml`:
  - HTTP port changed from 80 → 5501
  - HTTPS port changed from 443 → 5502
- `backend-setup.js`:
  - API endpoint changed from `localhost/v1` → `localhost:5501/v1`
  - Console URL changed from `localhost/console` → `localhost:5501/console`

---

## 🚀 **How to Use:**

### **Development Mode:**

```bash
cd fast-track
npm run dev
# App runs on http://localhost:9000
```

### **Production Mode:**

```bash
cd fast-track
npm run build
npm run serve:pwa
# App runs on http://localhost:5500
```

### **Appwrite Backend:**

```bash
cd appwrite
docker-compose up -d
# API available at http://localhost:5501
# Console available at http://localhost:5501/console
```

### **Backend Setup:**

```bash
cd fast-track
export APPWRITE_PROJECT_ID=your-project-id
node backend-setup.js
# Uses http://localhost:5501/v1 endpoint
```

---

## 🧪 **Testing:**

### **Test Environment:**

```bash
cd fast-track
npm run test
# Tests use http://localhost:5500
```

### **Integration Testing:**

```bash
# Start Appwrite backend
cd appwrite && docker-compose up -d

# Start FastTrack app
cd fast-track && npm run dev

# Test backend integration
cd fast-track && node backend-setup.js
```

---

## 🔍 **Port Range Summary:**

| Service          | Port | Purpose            |
| ---------------- | ---- | ------------------ |
| FastTrack Dev    | 9000 | Development server |
| FastTrack Prod   | 5500 | Production server  |
| Appwrite API     | 5501 | Backend API        |
| Appwrite HTTPS   | 5502 | Secure backend     |
| Test Environment | 5500 | Test server        |

---

## ✅ **Benefits:**

1. **No Port Conflicts**: All ports in 5500-5600 range
2. **Clear Separation**: Different port ranges for different services
3. **Easy to Remember**: Logical port numbering
4. **Development Friendly**: Won't conflict with other projects

---

## 🚨 **Important Notes:**

- **Development**: Uses Quasar's default port (9000) for hot reload
- **Production**: Uses port 5500 for consistency
- **Backend**: Uses ports 5501-5502 for Appwrite services
- **Testing**: Uses port 5500 to match production environment

**All port conflicts resolved!** 🎉
