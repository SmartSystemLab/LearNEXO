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
const dotenv_1 = require("dotenv");
const logging_1 = __importDefault(require("../middleware/logging"));
const mongoose_1 = __importDefault(require("mongoose"));
(0, dotenv_1.config)();
const mongoUri = process.env.MONGO_URI;
const mongooseConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    mongoose_1.default.connect(mongoUri)
        .then(() => logging_1.default.info('MongoDB Connected'))
        .catch((err) => logging_1.default.error('MongoDB Connection Error: ' + err));
});
exports.default = mongooseConnection;
//# sourceMappingURL=database.connection.js.map