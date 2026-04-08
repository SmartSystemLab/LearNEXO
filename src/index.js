"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { Server } from "http";
const dotenv_1 = require("dotenv");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const logging_1 = __importDefault(require("./middleware/logging"));
const errorHandler_1 = require("./middleware/errorHandler");
const database_connection_1 = __importDefault(require("./connections/database.connection"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const path_1 = __importDefault(require("path"));
const upload_routes_1 = __importDefault(require("./upload/upload.routes"));
const assessment_routes_1 = __importDefault(require("./assessment/assessment.routes"));
const app = (0, express_1.default)();
const httpServer = http_1.default.createServer(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
(0, dotenv_1.config)();
app.use((req, res, next) => {
    next();
});
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(undefined, { swaggerOptions: { url: "/swagger.json" } }));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send({
        message: "🚀 LearNexo server is up and running",
        status: true,
    });
}));
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/upload", upload_routes_1.default);
app.use("/api/v1/assessment", assessment_routes_1.default);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorResponse);
const PORT = Number(process.env.PORT) || 3000;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_connection_1.default)();
    }
    catch (error) {
        logging_1.default.error("Unable to connect to the database:" + error);
    }
    httpServer.listen(PORT, () => {
        logging_1.default.info(`🚀 App is running on port ${PORT}`);
    });
}))();
//# sourceMappingURL=index.js.map