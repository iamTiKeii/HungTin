import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Authenticate all requests to this router
router.use(authenticateToken as any);

// GET /api/interest-types
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const types = await prisma.interestType.findMany({
      orderBy: { name: "asc" },
    });
    return res.json(types);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
