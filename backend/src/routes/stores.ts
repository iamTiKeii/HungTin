import { Router, Response } from "express";
import { prisma } from "../utils/db";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { InMemoryCache } from "../utils/cache";

const router = Router();

// Apply auth middleware for all endpoints in this router
router.use(authenticateToken as any);

// 1. Get all stores
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = "stores_list";
    const cached = InMemoryCache.get<any[]>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const stores = await prisma.store.findMany({
      orderBy: { name: "asc" },
    });

    InMemoryCache.set(cacheKey, stores, 5 * 60 * 1000); // 5 min TTL
    return res.json(stores);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Get store by ID
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = `store_by_id:${req.params.id}`;
    const cached = InMemoryCache.get<any>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        employees: {
          select: { id: true, full_name: true, username: true, status: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    InMemoryCache.set(cacheKey, store, 5 * 60 * 1000); // 5 min TTL
    return res.json(store);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Create Store
router.post("/", requirePermission(["STORES_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, investment_capital, status, address, phone, opening_date, manager_id, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Store name is required" });
    }

    const newStore = await prisma.store.create({
      data: {
        name,
        investment_capital: Number(investment_capital) || 0,
        status: status || "active",
        address,
        phone,
        opening_date: opening_date ? new Date(opening_date) : null,
        manager_id,
        notes,
      },
    });

    // Clear caches
    InMemoryCache.delete("stores_list");

    return res.status(201).json(newStore);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Update Store
router.put("/:id", requirePermission(["STORES_MANAGE", "STORES_DETAIL"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, investment_capital, status, address, phone, opening_date, manager_id, notes } = req.body;

    const existingStore = await prisma.store.findUnique({
      where: { id: req.params.id },
    });

    if (!existingStore) {
      return res.status(404).json({ error: "Store not found" });
    }

    const updatedStore = await prisma.store.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        investment_capital: investment_capital !== undefined ? Number(investment_capital) : undefined,
        status: status || undefined,
        address: address !== undefined ? address : undefined,
        phone: phone !== undefined ? phone : undefined,
        opening_date: opening_date !== undefined ? (opening_date ? new Date(opening_date) : null) : undefined,
        manager_id: manager_id !== undefined ? manager_id : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    // Clear caches
    InMemoryCache.delete("stores_list");
    InMemoryCache.delete(`store_by_id:${req.params.id}`);

    return res.json(updatedStore);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Delete Store
router.delete("/:id", requirePermission(["STORES_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: {
        employees: true,
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    if (store.employees.length > 0) {
      return res.status(400).json({ error: "Cannot delete store because it has registered employees" });
    }

    await prisma.store.delete({
      where: { id: req.params.id },
    });

    // Clear caches
    InMemoryCache.delete("stores_list");
    InMemoryCache.delete(`store_by_id:${req.params.id}`);

    return res.json({ message: "Store deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
