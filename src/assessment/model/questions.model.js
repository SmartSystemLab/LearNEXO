"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const mongoose_aggregate_paginate_v2_1 = __importDefault(require("mongoose-aggregate-paginate-v2"));
const schema = new mongoose_1.Schema({
    questionNumber: { type: String, required: true },
    question: { type: String, required: true },
    options: {
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true },
        e: { type: String, required: true },
    },
    answer: {
        type: String,
        enum: ['a', 'b', 'c', 'd', 'e', 'N/A'],
        default: 'N/A',
        required: true,
    },
    category: {
        type: String,
        enum: ['Assessment', 'Questionnaire'],
        default: 'Assessment',
        required: true,
    },
    class: {
        type: String,
        required: true,
        default: 'N/A',
    },
    subject: {
        type: String,
        required: true,
        default: 'N/A',
    },
    subCategory: {
        type: String,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});
schema.plugin(mongoose_paginate_v2_1.default);
schema.plugin(mongoose_aggregate_paginate_v2_1.default);
exports.default = (0, mongoose_1.model)("Question", schema, "question");
//# sourceMappingURL=questions.model.js.map