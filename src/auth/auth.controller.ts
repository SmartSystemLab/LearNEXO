import { Get, Body, Path, Post, Query, Route, Tags } from 'tsoa';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, LoginDto } from './types/dto.types';
import Auth from './model/auth.model';
import jwt from 'jsonwebtoken'
import { access } from 'fs';


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
            const accessToken = jwt.sign(
                { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
                process.env.TOKEN_SECRET!, {expiresIn: '7d'})
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

}
