import { Request } from "express";
import jwt from "jsonwebtoken";

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[],
): Promise<any> {
  if (securityName === "BearerAuth") {
    const token = request.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new Error("No token provided");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return decoded;
    } catch (err) {
      throw new Error("Invalid token");
    }
  }

  throw new Error("Unknown security scheme");
}
