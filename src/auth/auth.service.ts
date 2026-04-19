import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

import Auth from "./model/auth.model";
import Onboarding from "./model/onboarding.model";
import Otp from "./model/otp.model";
import { ApiResponse } from "../common/dto/api-response";
import { EUserRole } from "./types/enums.type";

export class AuthService {
  async signUp(dto: any): Promise<ApiResponse> {
    const existingUser = await Auth.findOne({ email: dto.email });

    if (existingUser) {
      return {
        status: false,
        statusCode: 400,
        message: "User already exists",
        data: null,
      };
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.iSendOtp(dto.email);

    //Unique ID for users
    const rolePrefixMap: Record<EUserRole, string> = {
      parent: "PAR",
      student: "STU",
      teacher: "TEA",
      admin: "ADM",
      super_admin: "SUP",
    };

    const generateUserId = (role: EUserRole) => {
      const prefix = rolePrefixMap[role];
      const unique =
        Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
      return `${prefix}-${unique}`;
    };

    const userId = generateUserId(dto.role || EUserRole.STUDENT);

    const user = await Auth.create({
      ...dto,
      userId,
      password: hashedPassword,
    });

    user.password = undefined;

    return {
      status: true,
      statusCode: 201,
      message: "User created successfully",
      data: user,
    };
  }

  /**
   * LOGIN
   */
  async login(dto: any): Promise<ApiResponse> {
    const user = await Auth.findOne({ email: dto.email });

    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: null,
      };
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      return {
        status: false,
        statusCode: 401,
        message: "Invalid password",
        data: null,
      };
    }

    if (!user.isVerified) {
      return {
        status: false,
        statusCode: 403,
        message: "Account not verified",
        data: null,
      };
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.TOKEN_SECRET!,
      { expiresIn: "7d" },
    );

    return {
      status: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        accessToken: token,
        user,
      },
    };
  }

  /**
   * SEND OTP
   */
  async sendOtp(email: string): Promise<ApiResponse> {
    const ok = await this.iSendOtp(email);

    return ok
      ? { status: true, statusCode: 200, message: "OTP sent", data: null }
      : {
          status: false,
          statusCode: 500,
          message: "Failed to send OTP",
          data: null,
        };
  }

  /**
   * VERIFY OTP
   */
  async verifyOtp(dto: any): Promise<ApiResponse> {
    return this.iVerify(dto);
  }

  /**
   * RESET PASSWORD
   */
  async resetPassword(dto: any): Promise<ApiResponse> {
    const hashed = await bcrypt.hash(dto.password, 10);

    await Auth.updateOne({ email: dto.email }, { password: hashed });

    return {
      status: true,
      statusCode: 200,
      message: "Password updated",
      data: null,
    };
  }

  /**
   * ONBOARDING
   */
  async onboarding(
    body: any,
    file?: Express.Multer.File,
  ): Promise<ApiResponse> {
    await Onboarding.create({
      ...body,
      dateOfBirth: new Date(body.dateOfBirth),
      pastExam: JSON.parse(body.pastExam),
      photo: file,
    });

    return {
      status: true,
      statusCode: 200,
      message: "Onboarding completed",
      data: null,
    };
  }

  /**
   * PRIVATE OTP SENDER
   */
  private async iSendOtp(email: string): Promise<boolean> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      const expires = new Date(Date.now() + 10 * 60 * 1000);

      await Otp.findOneAndUpdate(
        { email },
        { otp: hashedOtp, otpExpiresIn: expires },
        { upsert: true },
      );

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"LearNEXO" <${process.env.AUTH_EMAIL}>`,
        to: email,
        subject: "Verify Email",
        html: `<h2>Your OTP is: ${otp}</h2>`,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * PRIVATE OTP VERIFY
   */
  private async iVerify(dto: any): Promise<ApiResponse> {
    const record = await Otp.findOne({ email: dto.email });

    if (!record) {
      return {
        status: false,
        statusCode: 400,
        message: "No OTP requested",
        data: null,
      };
    }

    if (record.otpExpiresIn < new Date()) {
      return {
        status: false,
        statusCode: 400,
        message: "OTP expired",
        data: null,
      };
    }

    const hashed = crypto.createHash("sha256").update(dto.otp).digest("hex");

    if (hashed !== record.otp) {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid OTP",
        data: null,
      };
    }

    await Otp.deleteOne({ email: dto.email });

    await Auth.updateOne({ email: dto.email }, { isVerified: true });

    return {
      status: true,
      statusCode: 200,
      message: "Verified",
      data: null,
    };
  }
}
