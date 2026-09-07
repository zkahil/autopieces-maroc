import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRealPartPhoto } from "@/lib/images";

describe("fetchRealPartPhoto", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne une image de secours si l'API échoue", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    const url = await fetchRealPartPhoto("Plaquettes de frein");
    expect(url).toContain("http");
  });

  it("retourne l'URL de la première image bitmap trouvée", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            "1": { imageinfo: [{ mime: "image/jpeg", thumburl: "https://example.com/brake.jpg" }] },
          },
        },
      }),
    });
    const url = await fetchRealPartPhoto("Disque de frein");
    expect(url).toBe("https://example.com/brake.jpg");
  });
});
