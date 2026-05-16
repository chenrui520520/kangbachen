import type { FastifyReply, FastifyRequest } from "fastify";
import { badRequest } from "../errors/http-error.js";
import { mediaUploadService } from "../services/media-upload.service.js";
import { auditService } from "../services/audit.service.js";
import { sendSuccess } from "../utils/response.js";

export const mediaAdminController = {
  upload: async (req: FastifyRequest, reply: FastifyReply) => {
    const file = await req.file();
    if (!file) throw badRequest('Missing file field "file"');

    const buffer = await file.toBuffer();
    const query = req.query as { category?: string };
    const asset = await mediaUploadService.saveImage(buffer, {
      filename: file.filename,
      mimetype: file.mimetype,
      category: query.category,
    });

    await auditService.log({
      adminUserId: req.adminAuth?.sub !== "api-key" ? req.adminAuth?.sub : undefined,
      action: "MEDIA_UPLOAD",
      resource: "Media",
      resourceId: asset.name,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return sendSuccess(reply, 200, asset);
  },

  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { category?: string };
    const rows = await mediaUploadService.listImages(query.category);
    return sendSuccess(reply, 200, rows);
  },
};
