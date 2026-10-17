import { describe, expect, it } from "vitest";
import {
  buildValidationUrl,
  isFailedGatewayStatus,
  isSuccessfulGatewayStatus,
  isValidationSuccess,
  normaliseIpn,
  parseIpnPayload,
  takaToPaisa,
} from "@/lib/sslcommerz";

describe("takaToPaisa", () => {
  it('converts taka decimal strings ("5058.00") to integer paisa', () => {
    expect(takaToPaisa("5058.00")).toBe(505800);
  });

  it("rounds sub-paisa dust once, must never produce floats", () => {
    expect(takaToPaisa("5058.005")).toBe(505801); // round-half-up
    expect(takaToPaisa(1200.5)).toBe(120050);
    expect(Number.isInteger(takaToPaisa("99.99"))).toBe(true);
  });
});

describe("gateway statuses", () => {
  it("treats VALID and VALIDATED as success (case-insensitive)", () => {
    expect(isSuccessfulGatewayStatus("VALID")).toBe(true);
    expect(isSuccessfulGatewayStatus("VALIDATED")).toBe(true);
    expect(isSuccessfulGatewayStatus(" validated ")).toBe(true);
  });

  it("does not treat PENDING/FAILED as success", () => {
    expect(isSuccessfulGatewayStatus("PENDING")).toBe(false);
    expect(isSuccessfulGatewayStatus("FAILED")).toBe(false);
  });

  it("recognises terminal failure statuses", () => {
    for (const s of ["FAILED", "CANCELED", "CANCELLED"]) {
      expect(isFailedGatewayStatus(s)).toBe(true);
    }
    expect(isFailedGatewayStatus("PENDING")).toBe(false);
    expect(isFailedGatewayStatus("VALID")).toBe(false);
  });
});

describe("normaliseIpn", () => {
  const base = {
    tran_id: "BR-100231",
    val_id: "88abc",
    amount: "5058.00",
    currency: "BDT",
    status: "VALID",
  };

  it("normalises order number, amount in paisa, currency casing", () => {
    const r = normaliseIpn({ ...base, currency: " bdt " });
    expect(r).not.toBeNull();
    expect(r!.orderNo).toBe("BR-100231");
    expect(r!.amountPaisa).toBe(505800);
    expect(r!.currency).toBe("BDT");
    expect(r!.tranId).toBe("BR-100231");
  });

  it("prefers an explicit orderNo/order_no over tran_id", () => {
    expect(normaliseIpn({ ...base, orderNo: "BR-77" })!.orderNo).toBe("BR-77");
    expect(normaliseIpn({ ...base, order_no: "BR-88" })!.orderNo).toBe("BR-88");
  });

  it("keeps the raw payload for the payments ledger", () => {
    const raw = { ...base, "store_amount": "5000", card_type: "VISA" };
    const r = normaliseIpn(raw);
    expect(r!.raw).toEqual(raw);
  });

  it("rejects missing required fields", () => {
    expect(normaliseIpn({ ...base, val_id: "" })).toBeNull();
    expect(normaliseIpn({ ...base, tran_id: "" })).toBeNull();
    expect(normaliseIpn({ ...base, amount: "0" })).toBeNull();
    expect(normaliseIpn({ ...base, amount: "-5" })).toBeNull();
    expect(normaliseIpn({})).toBeNull();
  });
});

describe("parseIpnPayload", () => {
  it("parses the form-urlencoded body SSLCommerz actually posts", async () => {
    const body = new URLSearchParams({
      tran_id: "BR-100231",
      val_id: "88abc",
      amount: "5058.00",
      currency: "BDT",
      status: "VALID",
    }).toString();
    const request = new Request("http://x/ipn", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const parsed = await parseIpnPayload(request);
    expect(parsed?.tran_id).toBe("BR-100231");
    expect(parsed?.amount).toBe("5058.00");
  });

  it("parses json bodies", async () => {
    const request = new Request("http://x/ipn", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tran_id: "BR-1", val_id: "v", amount: "10.00", currency: "BDT", status: "VALID" }),
    });
    const parsed = await parseIpnPayload(request);
    expect(parsed?.tran_id).toBe("BR-1");
  });

  it("rejects empty/broken bodies", async () => {
    const empty = new Request("http://x/ipn", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "",
    });
    expect(await parseIpnPayload(empty)).toBeNull();

    const broken = new Request("http://x/ipn", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{oops",
    });
    expect(await parseIpnPayload(broken)).toBeNull();
  });
});

describe("buildValidationUrl", () => {
  it("builds the validator URL on the configured endpoint", () => {
    const url = buildValidationUrl({
      endpoint: "https://sandbox.sslcommerz.com/",
      storeId: "store123",
      storePass: "pass456@",
      valId: "88abc",
    });
    expect(url.startsWith("https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php")).toBe(true);
    expect(url).toContain("val_id=88abc");
    expect(url).toContain("store_id=store123");
    expect(url).toContain("format=json");
  });

  it("defaults to the live endpoint when none is configured", () => {
    const url = buildValidationUrl({ endpoint: "", storeId: "s", storePass: "p", valId: "v" });
    expect(url.startsWith("https://securepay.sslcommerz.com/")).toBe(true);
  });
});

describe("isValidationSuccess", () => {
  it("requires VALID/VALIDATED and BDT", () => {
    expect(isValidationSuccess({ status: "VALID", currency: "BDT" })).toBe(true);
    expect(isValidationSuccess({ status: "VALID" })).toBe(true); // currency defaults to BDT
    expect(isValidationSuccess({ status: "VALID", currency: "USD" })).toBe(false);
    expect(isValidationSuccess({ status: "FAILED", currency: "BDT" })).toBe(false);
    expect(isValidationSuccess({})).toBe(false);
  });
});
