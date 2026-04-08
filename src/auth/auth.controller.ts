import { Get, Body, FormField, Path, Post, Request, UploadedFile, Query, Route, Tags, Inject, Security } from 'tsoa';
import * as bcrypt from 'bcryptjs';
import { SignUpDto, LoginDto, VerifyDto, OnboardingDto } from './types/dto.types';
import Auth from './model/auth.model';
import Onboarding from './model/onboarding.model';
import Otp from './model/otp.model';
import jwt from 'jsonwebtoken'
import crypto from "crypto";
import nodemailer from "nodemailer";
// import multer from "multer";

// const upload = multer({ dest: "uploads/" });

type ApiResponse = {
  status: boolean;
  statusCode: number;
  message: string;
  data: any;
};    


@Tags("Auth")
@Route("api/v1/auth")
export default class AuthController {
  @Post("/sign-up")
  public async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const existingUser = await Auth.findOne({ email: signUpDto.email });
      if (existingUser) {
        return {
          statusCode: 400,
          status: false,
          message: "User already exists",
          data: null,
        };
      }
      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
      this.iSendOtp(signUpDto.email);
      signUpDto.password = hashedPassword;
      const userData = await Auth.create(signUpDto);
      userData.password = undefined;
      return {
        statusCode: 201,
        status: true,
        message: "User created successfully",
        data: userData,
      };
    } catch (error: any) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null,
      };
    }
  }

  @Post("/login")
  public async login(@Body() loginDto: LoginDto) {
    try {
      const user = await Auth.findOne({ email: loginDto.email });
      if (!user) {
        return {
          statusCode: 404,
          status: false,
          message: "User not found",
          data: null,
        };
      }
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          statusCode: 401,
          status: false,
          message: "Invalid password",
          data: null,
        };
      }
      if (!user.isVerified) {
        return {
          statusCode: 403,
          status: false,
          message: "User account not verified",
          data: null,
        };
      }
      const accessToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        process.env.TOKEN_SECRET!,
        { expiresIn: "7d" },
      );
      return {
        statusCode: 200,
        status: true,
        message: "Login successful",
        data: {
          accessToken,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error: any) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null,
      };
    }
  }

  @Get("/send-otp/{email}")
  public async sendOtp(@Path() email: string) {
    const value = await this.iSendOtp(email);
    if (value) {
      return {
        statusCode: 200,
        status: true,
        message: "otp sent successfully",
        data: null,
      };
    } else {
      return {
        status: false,
        statusCode: 500,
        message: "Something went wrong",
        data: null,
      };
    }
  }

  @Post("/verify-otp")
  public async verifyOtp(@Body() verifyDto: VerifyDto) {
    try {
      await this.iVerify(verifyDto);
      return {
        status: true,
        statusCode: 200,
        message: "",
        data: null,
      };
    } catch (error: any) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null,
      };
    }
  }

  @Post("/verify-forgot-password-otp")
  public async verify(@Body() verifyDto: VerifyDto) {
    try {
      const verification = await this.iVerify(verifyDto);
      if (!verification.status) {
        return verification;
      }
      await Auth.updateOne(
        {
          email: verifyDto.email,
        },
        {
          isVerified: true,
        },
      );

      return {
        status: true,
        statusCode: 200,
        message: "Account verified",
        data: null,
      };
    } catch (error: any) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null,
      };
    }
  }

  @Post("/reset-password")
  public async resetPassword(@Body() loginDto: LoginDto) {
    try {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      await Auth.updateOne(
        {
          email: loginDto.email,
        },
        {
          password: hashedPassword,
        },
      );
      return {
        status: true,
        statusCode: 200,
        message: "Password changed successfully",
        data: null,
      };
    } catch (error: any) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null,
      };
    }
  }

  @Post("/onboarding")
public async onboarding(
  @UploadedFile() photo: Express.Multer.File,

  @FormField() dateOfBirth: string,
  @FormField() studentClass: string,
  @FormField() gender: string,
  @FormField() town: string,
  @FormField() state: string,
  @FormField() schoolName: string,
  @FormField() schoolAddress: string,
  @FormField() learningStyle: string,
  @FormField() pastExam: string,
  @FormField() language: string,
  @FormField() residentialAddress: string,
  @FormField() stateOfOrigin: string
): Promise<ApiResponse>  {
  try {
    const data = {
      dateOfBirth: new Date(dateOfBirth),
      studentClass,
      gender,
      town,
      state,
      schoolName,
      schoolAddress,
      learningStyle,
      pastExam: JSON.parse(pastExam),
      language,
      residentialAddress,
      stateOfOrigin,
      photo: photo?.path,
    };

    await Onboarding.create(data);

    return {
      status: true,
      statusCode: 200,
      message: "Onboarding completed successfully",
      data: null,
    };
  } catch (error: any) {
    return {
      status: false,
      statusCode: 500,
      message: error.message || "Internal Server Error",
      data: null,
    };
  }
}

  private async iSendOtp(email: string): Promise<boolean> {
    try {
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const mailOptions = {
        from: "oliverpraise1@gmail.com",
        to: "praiseolukiran@gmal.com",
        subject: "Verify Your Email",
        html: `<p> Enter ${otp} on LearNEXO website to verify your email address </p>`,
      };

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "oliverpraise@gmail.com",
          pass: "Tran#for.7",
        },
      });

      await transporter
        .verify()
        .then(() => console.log("Mailer ready"))
        .catch((err) => console.error("Mailer error:", err));

      // Hash OTP before saving (security)
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

      const otpExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      // Upsert (update or create in ONE call)
      await Otp.findOneAndUpdate(
        { email, otp: hashedOtp, otpExpiresIn },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      await transporter.sendMail(mailOptions);

      // TODO: send OTP via email service here
      console.log(`OTP for ${email}: ${otp}`);

      return true;
    } catch (error) {
      console.error("Error sending OTP:", error);
      return false;
    }
  }

  private async iVerify(verifyDto: VerifyDto) {
    try {
      const otpUser = await Otp.findOne({
        email: verifyDto.email,
      });
      if (!otpUser) {
        return {
          status: false,
          statusCode: 400,
          message: "You have not requested for otp",
          data: null,
        };
      }
      if (otpUser.otpExpiresIn < Date.now()) {
        return {
          status: false,
          statusCode: 400,
          message: "Otp have expired",
          data: null,
        };
      }
      if (verifyDto.otp !== otpUser.otp) {
        return {
          status: false,
          statusCode: 400,
          message: "incorrect Otp",
          data: null,
        };
      }
      await Otp.deleteOne({
        email: verifyDto.email,
      });

      return {
        status: true,
        statusCode: 200,
        message: "verified",
        data: null,
      };
    } catch (error: any) {
      return {
        status: false,
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null,
      };
    }
  }
}
