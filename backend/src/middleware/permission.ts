import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

export const requirePermission = (requiredCodes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const hasPermission = requiredCodes.some((code) =>
      req.user!.permissions.includes(code)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: `Forbidden: You do not have the required permissions (${requiredCodes.join(", ")}) to perform this action.`,
      });
    }

    next();
  };
};
