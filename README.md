# LearNEXO
# 📚 LearNexo - an Edtack App that infuses AI into learning

This project is a TypeScript-based EdTech application

---

## 💻 Running Locally

### 1. Clone and Install
```bash
git clone https://github.com/SmartSystemLab/LearNEXO.git
cd LearNEXO
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```env
PORT=7090
MONGO_URI=your_db_uri
```

### 3. Run the Project

Use:
```bash
npm run start:dev
```

---

## 🐳 Docker Deployment

Build and run the container by running this code in the same directory the dockerfile is :
```bash
docker build -t my-app .
docker run -p 8900:8900 my-app
```

Make sure your `.env` file is correctly set before running this.

### 🔍 Swagger Docs

Access detailed API schema at:  
👉 **[http://localhost:8900/api-docs](http://localhost:8900/api-docs)**

---

## 📁 Project Scripts

Check `package.json` for all available commands:
```json
  "scripts": {
    "test": "jest",
    "predev": "npm run swagger",
    "prebuild": "npm run swagger",
    "build": "tsc --build",
    "start": "node ./dist/index.js",
    "start:dev": "concurrently \"nodemon\" \"nodemon -x tsoa spec\"",
    "swagger": "tsoa spec",
    "format": "prettier --ignore-path .gitignore --write \"**/*.+(js|ts|json)\""
  },
```

**Made with ❤️ by Akintola Felix**  
