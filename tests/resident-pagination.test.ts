import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn(), findMany: vi.fn(), count: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({ prisma: { resident: { findMany: mocks.findMany, count: mocks.count } } }));
import { GET } from "../src/app/api/admin/residents/route";

describe("resident list API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin" });
    mocks.findMany.mockResolvedValue([{ id: "resident-21" }]);
    mocks.count.mockResolvedValue(45);
  });

  it("retrieves subsequent pages with database-wide filters and stable sorting", async () => {
    const response = await GET(new Request("http://localhost/api/admin/residents?page=2&limit=20&search=Ana&status=VERIFIED&sort=createdBy&direction=desc"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.pagination).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3 });
    const query = mocks.findMany.mock.calls[0][0];
    expect(query.skip).toBe(20);
    expect(query.take).toBe(20);
    expect(query.where.status).toBe("VERIFIED");
    expect(query.where.OR).toContainEqual({ fullName: { contains: "Ana", mode: "insensitive" } });
    expect(mocks.count).toHaveBeenCalledWith({ where: query.where });
    expect(query.orderBy).toEqual([{ createdBy: { name: "desc" } }, { id: "asc" }]);
    expect(query.select).not.toHaveProperty("nikEncrypted");
  });

  it("uses safe defaults for invalid pagination and unknown sort fields", async () => {
    await GET(new Request("http://localhost/api/admin/residents?page=NaN&limit=1000&sort=__proto__"));
    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 100, orderBy: [{ createdAt: "desc" }, { id: "asc" }] }));
  });

  it("rejects invalid status filters", async () => {
    const response = await GET(new Request("http://localhost/api/admin/residents?status=invalid"));
    expect(response.status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("requires admin access before querying residents", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("UNAUTHORIZED"));
    expect((await GET(new Request("http://localhost/api/admin/residents?page=2"))).status).toBe(403);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
