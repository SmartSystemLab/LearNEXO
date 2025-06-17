import { EUserRole } from "./enums.type";

export type SignUpDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: EUserRole
}

export type LoginDto = {
    email: string;
    password: string;
}

export type VerifyDto = {
    email: string;
    otp: string;
}