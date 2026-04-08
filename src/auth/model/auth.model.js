"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const enums_type_1 = require("../types/enums.type");
const schema = new mongoose_1.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    role: { type: String, enum: Object.values(enums_type_1.EUserRole), default: enums_type_1.EUserRole.STUDENT },
    isVerified: { type: Boolean, default: false },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.default = (0, mongoose_1.model)("Auth", schema, "auth");
//# sourceMappingURL=auth.model.js.map