import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import Auth from "./model/auth.model";
import Onboarding from "./model/onboarding.model";
import Otp from "./model/otp.model";
import { ApiResponse } from "../common/dto/api-response";
import { EUserRole } from "./types/enums.type";
import { nanoid } from "nanoid";



export class AuthService {
  async signUp(dto: any): Promise<ApiResponse> {
    try {
      const existingUser = await Auth.findOne({
        email: dto.email,
      });

      if (existingUser) {
        return {
          status: false,
          statusCode: 400,
          message: "User already exists",
          data: null,
        };
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Role prefixes
      const rolePrefixMap: Record<EUserRole, string> = {
        parent: "PAR",
        student: "STU",
        teacher: "TEA",
        admin: "ADM",
        super_admin: "SUP",
      };

      // Generate unique user ID
      const generateUserId = (role: EUserRole) => {
        const prefix = rolePrefixMap[role];

        return `${prefix}-${nanoid(6).toUpperCase()}`;
      };

      const userId = generateUserId(dto.role || EUserRole.STUDENT);

      // Create unverified user first
      const user = await Auth.create({
        ...dto,
        userId,
        password: hashedPassword,
        isVerified: false,
      });

      // Send OTP
      const otpSent = await this.iSendOtp(dto.email);

      // Rollback user creation if OTP fails
      if (!otpSent) {
        await Auth.findByIdAndDelete(user._id);

        return {
          status: false,
          statusCode: 500,
          message: "Failed to send OTP",
          data: null,
        };
      }

      // Remove password safely
      const userResponse = user.toObject();

      delete userResponse.password;

      return {
        status: true,
        statusCode: 201,
        message: "User created successfully. OTP sent to email.",
        data: userResponse,
      };
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      return {
        status: false,
        statusCode: 500,
        message: "Something went wrong",
        data: null,
      };
    }
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
        { upsert: true, new: true },
      );

      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "LearNEXO", email: process.env.AUTH_EMAIL },
          to: [{ email }],
          subject: "Verify Your Email",
          htmlContent: `
            <div style="font-family: Arial, sans-serif;">
              <h2>LearNEXO Email Verification</h2>
              <p>Your OTP Code is:</p>
              <h1 style="letter-spacing: 5px;">${otp}</h1>
              <p>This code expires in 10 minutes.</p>
              <p>If you did not request this, please ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("[iSendOtp] Brevo API error:", res.status, body);
        return false;
      }

      console.log("[iSendOtp] Mail sent via Brevo API to:", email);
      return true;
    } catch (error) {
      console.error("[iSendOtp] Error:", error);
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
