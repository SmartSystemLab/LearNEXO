"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "Auth", required: true },
    dateOfBirth: { type: Date, default: null },
    class: { type: String, default: null },
    gender: { type: String, default: null },
    stateOfOrigin: { type: String, default: null },
    residentialAddress: { type: String, default: null },
    town: { type: String, default: null },
    state: { type: String, default: null },
    schoolName: { type: String, default: null },
    schoolAddress: { type: String, default: null },
    learningStyle: { type: String, default: null },
    pastExam: {
        firstTerm: { type: String, default: null },
        secondTerm: { type: String, default: null },
        thirdTerm: { type: String, default: null }
    },
    photo: { type: String, default: null },
    language: { type: String, default: null },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true });
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.default = (0, mongoose_1.model)("Onboarding", schema, "onboarding");
//# sourceMappingURL=onboarding.model.js.map