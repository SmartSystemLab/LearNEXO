"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.validate(req.body);
        if (result.error) {
            res.status(400).json({
                status: false,
                error: result.error.details[0].message,
                message: result.error.details[0].message,
                data: null
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.js.map