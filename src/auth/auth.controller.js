"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcrypt = __importStar(require("bcryptjs"));
const auth_model_1 = __importDefault(require("./model/auth.model"));
const onboarding_model_1 = __importDefault(require("./model/onboarding.model"));
const otp_model_1 = __importDefault(require("./model/otp.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
let AuthController = class AuthController {
    signUp(signUpDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield auth_model_1.default.findOne({ email: signUpDto.email });
                if (existingUser) {
                    return {
                        statusCode: 400,
                        status: false,
                        message: 'User already exists',
                        data: null
                    };
                }
                const hashedPassword = yield bcrypt.hash(signUpDto.password, 10);
                this.iSendOtp(signUpDto.email);
                signUpDto.password = hashedPassword;
                const userData = yield auth_model_1.default.create(signUpDto);
                userData.password = undefined;
                return {
                    statusCode: 201,
                    status: true,
                    message: 'User created successfully',
                    data: userData
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
    login(loginDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield auth_model_1.default.findOne({ email: loginDto.email });
                if (!user) {
                    return {
                        statusCode: 404,
                        status: false,
                        message: 'User not found',
                        data: null
                    };
                }
                const isPasswordValid = yield bcrypt.compare(loginDto.password, user.password);
                if (!isPasswordValid) {
                    return {
                        statusCode: 401,
                        status: false,
                        message: 'Invalid password',
                        data: null
                    };
                }
                if (!user.isVerified) {
                    return {
                        statusCode: 403,
                        status: false,
                        message: 'User account not verified',
                        data: null
                    };
                }
                const accessToken = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
                return {
                    statusCode: 200,
                    status: true,
                    message: 'Login successful',
                    data: {
                        accessToken,
                        user: {
                            id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role
                        }
                    }
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
    sendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.iSendOtp(email);
            if (value) {
                return {
                    statusCode: 200,
                    status: true,
                    message: 'otp sent successfully',
                    data: null
                };
            }
            else {
                return {
                    status: false,
                    statusCode: 500,
                    message: 'Something went wrong',
                    data: null
                };
            }
        });
    }
    verify(verifyDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verification = yield this.iVerify(verifyDto);
                if (!verification.status) {
                    return verification;
                }
                yield auth_model_1.default.updateOne({
                    email: verifyDto.email
                }, {
                    isVerified: true
                });
                return {
                    status: true,
                    statusCode: 200,
                    message: 'Account verified',
                    data: null
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
    verifyOtp(verifyDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.iVerify(verifyDto);
                return {
                    status: true,
                    statusCode: 200,
                    message: '',
                    data: null
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
    resetPassword(loginDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield bcrypt.hash(loginDto.password, 10);
                yield auth_model_1.default.updateOne({
                    email: loginDto.email
                }, {
                    password: hashedPassword
                });
                return {
                    status: true,
                    statusCode: 200,
                    message: 'Password changed successfully',
                    data: null
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
    onboarding(onboardingDto, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield onboarding_model_1.default.create(Object.assign(Object.assign({}, onboardingDto), { user: userId }));
                return {
                    status: false,
                    statusCode: 200,
                    message: 'Onboarding completed successfully',
                    data: null
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
    iSendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate random 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const mailOptions = {
                    from: "oliverpraise1@gmail.com",
                    to: "praiseolukiran@gmal.com",
                    subject: "Verify Your Email",
                    html: `<p> Enter ${otp} on LearNEXO website to verify your email address </p>`
                };
                const transporter = nodemailer_1.default.createTransport({
                    service: "Gmail",
                    auth: {
                        user: "oliverpraise@gmail.com",
                        pass: "Tran#for.7",
                    },
                });
                yield transporter
                    .verify()
                    .then(() => console.log("Mailer ready"))
                    .catch((err) => console.error("Mailer error:", err));
                // Hash OTP before saving (security)
                const hashedOtp = crypto_1.default
                    .createHash("sha256")
                    .update(otp)
                    .digest("hex");
                const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
                // Upsert (update or create in ONE call)
                yield otp_model_1.default.findOneAndUpdate({ email,
                    otp: hashedOtp,
                    otpExpiresIn,
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                });
                yield transporter.sendMail(mailOptions);
                // TODO: send OTP via email service here
                console.log(`OTP for ${email}: ${otp}`);
                return true;
            }
            catch (error) {
                console.error("Error sending OTP:", error);
                return false;
            }
        });
    }
    iVerify(verifyDto) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otpUser = yield otp_model_1.default.findOne({
                    email: verifyDto.email
                });
                if (!otpUser) {
                    return {
                        status: false,
                        statusCode: 400,
                        message: 'You have not requested for otp',
                        data: null
                    };
                }
                if (otpUser.otpExpiresIn < Date.now()) {
                    return {
                        status: false,
                        statusCode: 400,
                        message: 'Otp have expired',
                        data: null
                    };
                }
                if (verifyDto.otp !== otpUser.otp) {
                    return {
                        status: false,
                        statusCode: 400,
                        message: 'incorrect Otp',
                        data: null
                    };
                }
                yield otp_model_1.default.deleteOne({
                    email: verifyDto.email
                });
                return {
                    status: true,
                    statusCode: 200,
                    message: 'verified',
                    data: null
                };
            }
            catch (error) {
                return {
                    status: false,
                    statusCode: 500,
                    message: error.message || 'Internal Server Error',
                    data: null
                };
            }
        });
    }
};
__decorate([
    (0, tsoa_1.Post)('/sign-in'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    (0, tsoa_1.Post)('/login'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, tsoa_1.Get)("/send-otp/{email}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, tsoa_1.Post)('/verify'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, tsoa_1.Post)('/verify-otp'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, tsoa_1.Post)("/reset-password"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, tsoa_1.Post)("/onboarding/{userId}"),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "onboarding", null);
AuthController = __decorate([
    (0, tsoa_1.Tags)('Auth'),
    (0, tsoa_1.Route)('api/v1/auth')
], AuthController);
exports.default = AuthController;
//# sourceMappingURL=auth.controller.js.map