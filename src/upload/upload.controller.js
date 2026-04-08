"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const tsoa_1 = require("tsoa");
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
let UploadController = class UploadController extends tsoa_1.Controller {
    upload(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                cloudinary_1.v2.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });
                const streamUpload = () => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary_1.v2.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                            if (result) {
                                resolve(result);
                            }
                            else {
                                reject(error);
                            }
                        });
                        streamifier_1.default.createReadStream(file.buffer).pipe(stream);
                    });
                };
                const result = yield streamUpload();
                return {
                    statusCode: 200,
                    status: true,
                    message: "File uploaded successfully'",
                    data: result
                };
            }
            catch (error) {
                return {
                    statusCode: 200,
                    status: true,
                    message: "Internal server error'",
                    data: null
                };
            }
        });
    }
};
__decorate([
    (0, tsoa_1.SuccessResponse)('200', 'File uploaded successfully'),
    (0, tsoa_1.Response)('400', 'Bad Request'),
    (0, tsoa_1.Response)('500', 'Internal Server Error'),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "upload", null);
UploadController = __decorate([
    (0, tsoa_1.Tags)('Upload'),
    (0, tsoa_1.Route)('api/v1/upload')
], UploadController);
exports.default = UploadController;
//# sourceMappingURL=upload.controller.js.map