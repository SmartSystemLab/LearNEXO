"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class Logging {
}
Logging.info = (args) => console.log(chalk_1.default.blue(`
[${new Date().toLocaleString()}]
[Log]:`), typeof args === "string" ? chalk_1.default.blueBright(args) : args);
Logging.warn = (args) => console.log(chalk_1.default.yellow(`
[${new Date().toLocaleString()}]
[Info]:`), typeof args === "string" ? chalk_1.default.yellowBright(args) : args);
Logging.error = (args) => console.log(chalk_1.default.red(`
[${new Date().toLocaleString()}]
[Warn]:`), typeof args === "string" ? chalk_1.default.redBright(args) : args);
Logging.log = (args) => console.log(chalk_1.default.green(`
[${new Date().toLocaleString()}]
[Error]:`), typeof args === "string" ? chalk_1.default.greenBright(args) : args);
exports.default = Logging;
//# sourceMappingURL=logging.js.map