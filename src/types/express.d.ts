import { Types } from "mongoose";

declare global {
  namespace Express {
    interface UserPayload {
      id: Types.ObjectId | string;
      email?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
