/* eslint-disable @typescript-eslint/no-explicit-any */
import { createUploadthing } from "uploadthing/server";

const ut = createUploadthing();

export const uploadRouter = ut({
  attachmentUploader: ut({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  }),
} as any) as any;

export type AppFileRouter = typeof uploadRouter;
