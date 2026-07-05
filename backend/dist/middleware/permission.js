"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
const requirePermission = (requiredCodes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const hasPermission = requiredCodes.some((code) => req.user.permissions.includes(code));
        if (!hasPermission) {
            return res.status(403).json({
                error: `Forbidden: You do not have the required permissions (${requiredCodes.join(", ")}) to perform this action.`,
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
