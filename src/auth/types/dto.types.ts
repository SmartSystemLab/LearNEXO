import { EUserRole } from "./enums.type";

export type SignUpDto = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: EUserRole
}