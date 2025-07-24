import { Get, Body, Path, Post, Query, Route, Tags, Inject, Security } from 'tsoa';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, LoginDto, VerifyDto, OnboardingDto } from './types/dto.types';
import Auth from './model/auth.model';
import Onboarding from './model/onboarding.model';
import Otp from './model/otp.model';
import jwt from 'jsonwebtoken'

@Tags('Auth')
@Route('api/v1/auth')
export default class AuthController {
    @Post('/sign-in')
    public async signUp(@Body() signUpDto: SignUpDto) {
        try {
            const existingUser = await Auth.findOne({ email: signUpDto.email });
            if (existingUser) {
                return {
                    statusCode: 400,
                    status: false,
                    message: 'User already exists',
                    data: null
                }
            }
            const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
            this.iSendOtp(signUpDto.email)
            signUpDto.password = hashedPassword;
            await Auth.create(signUpDto)
            return {
                statusCode: 201,
                status: true,
                message: 'User created successfully',
                data: null
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

    @Post('/login')
    public async login(@Body() loginDto: LoginDto) {
        try {
            const user = await Auth.findOne({ email: loginDto.email });
            if (!user) {
                return {
                    statusCode: 404,
                    status: false,
                    message: 'User not found',
                    data: null
                }
            }
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                return {
                    statusCode: 401,
                    status: false,
                    message: 'Invalid password',
                    data: null
                }
            }
            if (!user.isVerified) {
                return {
                    statusCode: 403,
                    status: false,
                    message: 'User account not verified',
                    data: null
                }
            }
            const accessToken = jwt.sign(
                { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
                process.env.TOKEN_SECRET!, { expiresIn: '7d' })
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
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

    @Get("/send-otp/{email}")
    public async sendOtp(@Path() email: string) {
        const value = await this.iSendOtp(email)
        if (value) {
            return {
                statusCode: 200,
                status: true,
                message: 'otp sent successfully',
                data: null
            }
        }
        else {
            return {
                status: false,
                statusCode: 500,
                message: 'Something went wrong',
                data: null
            }
        }
    }

    @Post('/verify')
    public async verify(@Body() verifyDto: VerifyDto) {
        try {
            const verification = await this.iVerify(verifyDto)
            if (!verification.status) {
                return verification;
            }
            await Auth.updateOne({
                email: verifyDto.email
            }, {
                isVerified: true
            })

            return {
                status: true,
                statusCode: 200,
                message: 'Account verified',
                data: null
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

    @Post('/verify-otp')
    public async verifyOtp(@Body() verifyDto: VerifyDto) {
        try {
            await this.iVerify(verifyDto)
            return {
                status: true,
                statusCode: 200,
                message: '',
                data: null
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

    @Post("/reset-password")
    public async resetPassword(@Body() loginDto: LoginDto) {
        try {
            const hashedPassword = await bcrypt.hash(loginDto.password, 10);
            await Auth.updateOne({
                email: loginDto.email
            }, {
                password: hashedPassword
            })
            return {
                status: true,
                statusCode: 200,
                message: 'Password changed successfully',
                data: null
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }
    
    @Security('BearerAuth')
    @Post("/onboarding")
    public async onboarding(@Body() onboardingDto: OnboardingDto, @Inject() user: any) {
        try {
            await Onboarding.create({ ...onboardingDto, user: user.id });
            return {
                status: false,
                statusCode: 200,
                message: 'Onboarding completed successfully',
                data: null
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }


    private async iSendOtp(email: string) {
        try {
            const otp = "000000"
            const otpExpiresIn = Date.now() + (1000 * 60 * 10)
            const otpUser = await Otp.findOne({
                email
            })
            if (otpUser) {
                await Otp.updateOne({
                    email
                },
                    {
                        otp,
                        otpExpiresIn
                    })
            } else {
                await Otp.create({
                    email,
                    otp,
                    otpExpiresIn
                })
            }
            return true;

        } catch (error) {
            return false;
        }
    }

    private async iVerify(verifyDto: VerifyDto) {
        try {
            const otpUser = await Otp.findOne({
                email: verifyDto.email
            })
            if (!otpUser) {
                return {
                    status: false,
                    statusCode: 400,
                    message: 'You have not requested for otp',
                    data: null
                }
            }
            if (otpUser.otpExpiresIn < Date.now()) {
                return {
                    status: false,
                    statusCode: 400,
                    message: 'Otp have expired',
                    data: null
                }
            }
            if (verifyDto.otp !== otpUser.otp) {
                return {
                    status: false,
                    statusCode: 400,
                    message: 'incorrect Otp',
                    data: null
                }
            }
            await Otp.deleteOne({
                email: verifyDto.email
            })

            return {
                status: true,
                statusCode: 200,
                message: 'verified',
                data: null
            }
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

}
