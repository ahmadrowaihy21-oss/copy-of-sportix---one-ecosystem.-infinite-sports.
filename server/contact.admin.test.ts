import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("SPORTIX contact inquiry administration", () => {
  it("rejects unauthenticated attempts to list private contact messages", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.contact.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
