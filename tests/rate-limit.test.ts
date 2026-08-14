import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";
describe("rate limiter",()=>{beforeEach(resetRateLimits);it("blocks requests above the limit",()=>{expect(rateLimit("ip",2,1000,0).allowed).toBe(true);expect(rateLimit("ip",2,1000,1).allowed).toBe(true);expect(rateLimit("ip",2,1000,2).allowed).toBe(false);});it("resets after the window",()=>{rateLimit("ip",1,1000,0);expect(rateLimit("ip",1,1000,1000).allowed).toBe(true);});});
