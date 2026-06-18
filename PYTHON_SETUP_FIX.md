# 🔧 Fix Python Installation Error

## The Error
`BackendUnavailable: Cannot import 'setuptools.build_meta'`

This means setuptools is missing from your virtual environment.

---

## ✅ SOLUTION - Run These Commands

**In your terminal where you have (venv) active, run:**

```bash
# Step 1: Install setuptools and wheel first
pip install setuptools wheel

# Step 2: Upgrade pip
python -m pip install --upgrade pip

# Step 3: Now install all requirements
pip install -r requirements.txt
```

---

## 📋 Complete Commands (Copy & Paste)

```bash
pip install setuptools wheel
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Wait for all packages to install (takes 2-3 minutes).

---

## ✅ When Installation is Complete

You'll see: "Successfully installed [list of packages]"

**Then start the server:**

```bash
python app.py
```

**You should see:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
```

✅ **Backend is now running!**

---

## 🚀 Next: Start Frontend

**Open NEW terminal window:**

```bash
cd C:\Users\Alhasan\OneDrive\Desktop\NAPARI
npm run dev
```

---

## 📝 Summary

**Terminal 1 (Python Backend):**
```bash
cd python-engine
venv\Scripts\activate
pip install setuptools wheel
pip install -r requirements.txt
python app.py
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**Browser:**
```
http://localhost:3000
```

---

**Both servers must be running together!**
