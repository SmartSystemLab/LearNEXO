# LearNEXO
# 📚 LearNexo - an Edtech App that infuses AI into learning

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
PORT=7070
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

```
LearNEXO
├─ README.md
├─ dockerfile
├─ eslint.config.mjs
├─ nodemon.json
├─ package-lock.json
├─ package.json
├─ pnpm-lock.yaml
├─ public
│  └─ swagger.json
├─ src
│  ├─ assessment
│  │  ├─ assessment.controller.ts
│  │  ├─ model
│  │  │  └─ questions.model.ts
│  │  └─ types
│  │     ├─ dto.types.ts
│  │     └─ validation.schema.ts
│  ├─ auth
│  │  ├─ auth.controller.ts
│  │  ├─ model
│  │  │  ├─ auth.model.ts
│  │  │  ├─ onboarding.model.ts
│  │  │  ├─ otp.model.ts
│  │  │  └─ status.model.ts
│  │  ├─ types
│  │  │  ├─ dto.types.ts
│  │  │  ├─ enums.type.ts
│  │  │  ├─ index.ts
│  │  │  └─ validation.schema.type.ts
│  │  └─ util
│  │     ├─ helpers.util.ts
│  │     └─ jwt.util.ts
│  ├─ connections
│  │  └─ database.connection.ts
│  ├─ global
│  │  ├─ interface
│  │  │  ├─ error.interface.ts
│  │  │  └─ response.interface.ts
│  │  └─ types
│  │     └─ index.ts
│  ├─ index.ts
│  ├─ learning-style
│  │  ├─ learning-style.controller.ts
│  │  ├─ model
│  │  │  ├─ question.model.ts
│  │  │  ├─ response.model.ts
│  │  │  └─ result.model.ts
│  │  └─ types
│  ├─ middleware
│  │  ├─ errorHandler.ts
│  │  ├─ helper.ts
│  │  ├─ logging.ts
│  │  ├─ parseFormData.ts
│  │  ├─ validation.ts
│  │  └─ verifyJwt.ts
│  └─ upload
│     └─ upload.controller.ts
├─ tsconfig.json
├─ tsoa.json
└─ uploads

```

```
LearNEXO
├─ README.md
├─ dockerfile
├─ eslint.config.mjs
├─ nodemon.json
├─ package-lock.json
├─ package.json
├─ pnpm-lock.yaml
├─ public
│  └─ swagger.json
├─ src
│  ├─ app.ts
│  ├─ auth
│  │  ├─ auth.controller.ts
│  │  ├─ auth.service.ts
│  │  ├─ model
│  │  │  ├─ auth.model.ts
│  │  │  ├─ onboarding.model.ts
│  │  │  ├─ otp.model.ts
│  │  │  └─ status.model.ts
│  │  ├─ types
│  │  │  ├─ dto.types.ts
│  │  │  ├─ enums.type.ts
│  │  │  ├─ index.ts
│  │  │  └─ validation.schema.type.ts
│  │  └─ util
│  │     ├─ helpers.util.ts
│  │     └─ jwt.util.ts
│  ├─ common
│  │  └─ dto
│  │     └─ api-response.ts
│  ├─ config
│  │  └─ authentication.ts
│  ├─ connections
│  │  └─ database.connection.ts
│  ├─ docs
│  │  └─ swagger.ts
│  ├─ global
│  │  ├─ interface
│  │  │  ├─ error.interface.ts
│  │  │  └─ response.interface.ts
│  │  └─ types
│  │     └─ index.ts
│  ├─ middleware
│  │  ├─ errorHandler.ts
│  │  ├─ helper.ts
│  │  ├─ logging.ts
│  │  ├─ parseFormData.ts
│  │  ├─ validation.ts
│  │  └─ verifyJwt.ts
│  └─ questionnaire
│     ├─ model
│     │  ├─ question.model.ts
│     │  ├─ response.model.ts
│     │  └─ result.model.ts
│     ├─ questionnaire.controller.ts
│     └─ types
│        └─ dto.types.ts
├─ tsconfig.json
└─ tsoa.json

```
