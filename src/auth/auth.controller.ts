import { Get, Body, Path, Post, Query, Route, Tags } from 'tsoa';
import * as bcrypt from 'bcryptjs';


@Tags('Auth')
@Route('api/v1/auth')
export default class AuthController {
    @Post('/login')
    public async sendSignupOTP(@Body() data: any) {
        return {
            message: "OTP sent successfully",
            status: true
        };
    }
}
