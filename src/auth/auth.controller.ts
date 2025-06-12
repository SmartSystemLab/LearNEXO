import { Get, Body, Path, Post, Query, Route, Tags } from 'tsoa';
import * as bcrypt from 'bcryptjs';
import { Sign } from 'crypto';
import { SignUpDto } from './types/dto.types';
import Auth from './model/auth.model';


@Tags('Auth')
@Route('api/v1/auth')
export default class AuthController {
    @Post('/sign-in')
    public async signUp(@Body() signUpDto: SignUpDto) {
        try {
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
}
