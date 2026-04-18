/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "@/lib/uploadthing";

const handler = createRouteHandler({ router: uploadRouter as any });
export const GET = handler;
export const POST = handler;
