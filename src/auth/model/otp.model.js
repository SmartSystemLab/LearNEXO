"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    email: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiresIn: { type: Date, default: null },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.default = (0, mongoose_1.model)("Otp", schema, "otp");
//# sourceMappingURL=otp.model.js.map