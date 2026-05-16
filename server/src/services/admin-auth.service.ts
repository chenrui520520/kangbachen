import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env.js";
import { prisma } from "./prisma.js";
import { unauthorized } from "../errors/http-error.js";
import { auditService } from "./audit.service.js";

export type AdminRole = "SUPERADMIN" | "EDITOR" | "VIEWER";

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPERADMIN: ["*"],
  EDITOR: ["cms:read", "cms:write", "analytics:read", "users:read", "exports:read"],
  VIEWER: ["cms:read", "analytics:read", "users:read"],
};

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const attempt = scryptSync(password, salt, 64).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(attempt, "hex"));
  } catch {
    return false;
  }
}

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: AdminRole;
  type: "admin";
};

export const adminAuthService = {
  hashPassword,
  verifyPassword,

  hasPermission(role: AdminRole, permission: string): boolean {
    const perms = ROLE_PERMISSIONS[role] ?? [];
    return perms.includes("*") || perms.includes(permission);
  },

  async login(email: string, password: string, meta?: { ip?: string; userAgent?: string }) {
    const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
      throw unauthorized("Invalid admin credentials");
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await auditService.log({
      adminUserId: user.id,
      action: "ADMIN_LOGIN",
      resource: "AdminUser",
      resourceId: user.id,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    const env = loadEnv();
    const payload: AdminTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as AdminRole,
      type: "admin",
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  verifyToken(token: string): AdminTokenPayload {
    const env = loadEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
    if (decoded.type !== "admin") throw unauthorized("Invalid admin token");
    return decoded;
  },

  async ensureSeedAdmin() {
    const email = process.env.ADMIN_SEED_EMAIL ?? "admin@kangba.local";
    const password = process.env.ADMIN_SEED_PASSWORD ?? "kangba-admin-change-me";
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) return existing;
    return prisma.adminUser.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        role: "SUPERADMIN",
      },
    });
  },

  async seedDemoAdmins() {
    const accounts: Array<{ email: string; password: string; role: AdminRole }> = [
      {
        email: process.env.ADMIN_SEED_EMAIL ?? "admin@kangba.local",
        password: process.env.ADMIN_SEED_PASSWORD ?? "kangba-admin-change-me",
        role: "SUPERADMIN",
      },
      {
        email: process.env.ADMIN_EDITOR_EMAIL ?? "editor@kangba.local",
        password: process.env.ADMIN_EDITOR_PASSWORD ?? "kangba-editor-change-me",
        role: "EDITOR",
      },
      {
        email: process.env.ADMIN_VIEWER_EMAIL ?? "viewer@kangba.local",
        password: process.env.ADMIN_VIEWER_PASSWORD ?? "kangba-viewer-change-me",
        role: "VIEWER",
      },
    ];

    const created = [];
    for (const a of accounts) {
      const email = a.email.toLowerCase();
      const row = await prisma.adminUser.upsert({
        where: { email },
        update: { role: a.role, active: true },
        create: {
          email,
          passwordHash: hashPassword(a.password),
          role: a.role,
        },
      });
      created.push({ email: row.email, role: row.role });
    }
    return created;
  },

  sessionFingerprint(userAgent?: string, ip?: string) {
    return createHash("sha256").update(`${userAgent ?? ""}:${ip ?? ""}`).digest("hex").slice(0, 16);
  },
};
