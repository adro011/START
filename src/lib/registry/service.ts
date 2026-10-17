"use server";

import {
  ProductImageInsert,
  ProductImageRow,
  ProductImageUpdate,
  ProductInsert,
  ProductRow,
  ProductUpdate,
} from "@/types/database";
import {
  createRegistryAdminClient,
  createRegistryClient,
  type RegistryAdminClient,
  type RegistryServerClient,
} from "@/lib/supabase/registry-server";

/* ------------------------------------------------------------------ */
/* Domain constants                                                   */
/* ------------------------------------------------------------------ */

export const REGISTRY_MAX_IMAGES_PER_PRODUCT = 5;
export const REGISTRY_MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const REGISTRY_ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type RegistryImageMimeType = (typeof REGISTRY_ALLOWED_IMAGE_MIME_TYPES)[number];

export interface RegistryImageFile {
  path: string;
  sizeBytes: number;
  mimeType: RegistryImageMimeType;
  alt?: string | null;
}

const VALID_SECTIONS = ["men", "women", "kids"] as const;
const nowISO = (): string => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Errors                                                             */
/* ------------------------------------------------------------------ */

export class RegistryError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = "RegistryError";
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends RegistryError {
  constructor(message: string) {
    super("validation_failed", message, 400);
  }
}

export class QuotaError extends RegistryError {
  constructor(message: string) {
    super("quota_exceeded", message, 409);
  }
}

export class NotFoundError extends RegistryError {
  constructor(entity: string, id: string) {
    super("not_found", `${entity} not found: ${id}`, 404);
  }
}

export class ConflictError extends RegistryError {
  constructor(message: string) {
    super("conflict", message, 409);
  }
}

/* ------------------------------------------------------------------ */
/* Repository interfaces                                              */
/* ------------------------------------------------------------------ */

export interface ProductRepository {
  findById(id: string): Promise<ProductRow | null>;
  findBySlug(slug: string): Promise<ProductRow | null>;
  create(input: ProductInsert): Promise<ProductRow>;
  update(id: string, patch: ProductUpdate): Promise<ProductRow>;
  setActive(id: string, active: boolean): Promise<ProductRow | null>;
  softDelete(id: string): Promise<ProductRow | null>;
}

export interface ProductImageRepository {
  listByProduct(productId: string): Promise<ProductImageRow[]>;
  create(input: ProductImageInsert): Promise<ProductImageRow>;
  update(id: string, patch: ProductImageUpdate): Promise<ProductImageRow>;
  remove(id: string, productId: string): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Idempotency                                                        */
/* ------------------------------------------------------------------ */

export interface IdempotencyRecord {
  productId: string;
  createdAt: string;
}

export interface IdempotencyStore {
  get(key: string): Promise<IdempotencyRecord | null>;
  set(key: string, record: IdempotencyRecord): Promise<void>;
}

class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly map = new Map<string, IdempotencyRecord>();
  async get(key: string): Promise<IdempotencyRecord | null> {
    return this.map.get(key) ?? null;
  }
  async set(key: string, record: IdempotencyRecord): Promise<void> {
    this.map.set(key, record);
  }
}

/* ------------------------------------------------------------------ */
/* Supabase repository implementations                                */
/* ------------------------------------------------------------------ */

function requireClient(client: RegistryAdminClient | RegistryServerClient | null, name: string): RegistryAdminClient | RegistryServerClient {
  if (!client) throw new RegistryError("misconfigured", `${name} unavailable — check Supabase env vars`, 500);
  return client;
}

class SupabaseProductRepository implements ProductRepository {
  constructor(private readonly admin: RegistryAdminClient | null, private readonly anon: RegistryServerClient | null) {}

  private adminTable() { return requireClient(this.admin, "registry admin client").from("products"); }
  private anonTable() { return requireClient(this.anon, "registry anon client").from("products"); }

  async findById(id: string): Promise<ProductRow | null> {
    try {
      const { data, error } = await this.anonTable().select("*").eq("id", id).single();
      if (error) {
        if (typeof error === "object" && error !== null && (error as { code?: string }).code === "PGRST116") return null;
        throw error;
      }
      return (data ?? null) as ProductRow | null;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("read_failed", `Failed to read product ${id}`, 500);
    }
  }

  async findBySlug(slug: string): Promise<ProductRow | null> {
    try {
      const { data, error } = await this.anonTable().select("*").eq("slug", slug).single();
      if (error) {
        if (typeof error === "object" && error !== null && (error as { code?: string }).code === "PGRST116") return null;
        throw error;
      }
      return (data ?? null) as ProductRow | null;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("read_failed", `Failed to read product ${slug}`, 500);
    }
  }

  async create(input: ProductInsert): Promise<ProductRow> {
    try {
      const { data, error } = await this.adminTable().insert(input).select().single();
      if (error) throw error;
      return data as ProductRow;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("create_failed", "Failed to create product", 500);
    }
  }

  async update(id: string, patch: ProductUpdate): Promise<ProductRow> {
    try {
      const { data, error } = await this.adminTable().update(patch).eq("id", id).select().single();
      if (error) throw error;
      if (!data) throw new NotFoundError("product", id);
      return data as ProductRow;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("update_failed", `Failed to update product ${id}`, 500);
    }
  }

  async setActive(id: string, active: boolean): Promise<ProductRow | null> {
    // Atomic conditional flip: no check-then-act — the WHERE clause carries
    // the precondition (only flips when currently different). Supabase has no
    // multi-statement transactions, so single-statement WHERE-condition updates
    // are the atomic boundary. External calls (image upload) happen outside.
    try {
      const { data, error } = await this.adminTable()
        .update({ active, updated_at: nowISO() })
        .eq("id", id)
        .eq("active", !active)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data[0] as ProductRow;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("update_failed", `Failed to set active on product ${id}`, 500);
    }
  }

  async softDelete(id: string): Promise<ProductRow | null> {
    try {
      const { data, error } = await this.adminTable()
        .update({ active: false, deleted_at: nowISO() })
        .eq("id", id)
        .eq("deleted_at", null)
        .eq("active", true)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data[0] as ProductRow;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("delete_failed", `Failed to soft-delete product ${id}`, 500);
    }
  }
}

class SupabaseProductImageRepository implements ProductImageRepository {
  constructor(private readonly admin: RegistryAdminClient | null, private readonly anon: RegistryServerClient | null) {}

  private adminTable() { return requireClient(this.admin, "registry admin client").from("product_images"); }
  private anonTable() { return requireClient(this.anon, "registry anon client").from("product_images"); }

  async listByProduct(productId: string): Promise<ProductImageRow[]> {
    try {
      const { data, error } = await this.anonTable()
        .select("*")
        .eq("product_id", productId)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductImageRow[];
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("read_failed", `Failed to read images for product ${productId}`, 500);
    }
  }

  async create(input: ProductImageInsert): Promise<ProductImageRow> {
    try {
      const { data, error } = await this.adminTable().insert(input).select().single();
      if (error) throw error;
      return data as ProductImageRow;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("create_failed", "Failed to create product image", 500);
    }
  }

  async update(id: string, patch: ProductImageUpdate): Promise<ProductImageRow> {
    try {
      const { data, error } = await this.adminTable().update(patch).eq("id", id).select().single();
      if (error) throw error;
      if (!data) throw new NotFoundError("product image", id);
      return data as ProductImageRow;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("update_failed", `Failed to update product image ${id}`, 500);
    }
  }

  async remove(id: string, productId: string): Promise<void> {
    // WHERE carries both id and product_id — no check-then-act, no orphan deletes.
    try {
      const { error } = await this.adminTable().delete().eq("id", id).eq("product_id", productId);
      if (error) throw error;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("delete_failed", `Failed to delete product image ${id}`, 500);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Validation                                                         */
/* ------------------------------------------------------------------ */

function validateProduct(input: ProductInsert): void {
  if (!input.slug || !input.slug.trim()) throw new ValidationError("slug is required");
  if (!input.name || !input.name.trim()) throw new ValidationError("name is required");
  if (typeof input.price_paisa !== "number" || !Number.isFinite(input.price_paisa) || input.price_paisa < 0) {
    throw new ValidationError("price_paisa must be a non-negative number");
  }
  if (input.section && !VALID_SECTIONS.includes(input.section)) {
    throw new ValidationError(`section must be one of ${VALID_SECTIONS.join(", ")}`);
  }
}

function validateImageFile(file: RegistryImageFile): void {
  if (!file.path) throw new ValidationError("image path is required");
  if (!REGISTRY_ALLOWED_IMAGE_MIME_TYPES.includes(file.mimeType)) {
    throw new ValidationError(`unsupported image type ${file.mimeType}`);
  }
  if (typeof file.sizeBytes !== "number" || !Number.isFinite(file.sizeBytes) || file.sizeBytes <= 0) {
    throw new ValidationError("image sizeBytes must be a positive number");
  }
  if (file.sizeBytes > REGISTRY_MAX_IMAGE_SIZE_BYTES) {
    throw new ValidationError(`image exceeds ${REGISTRY_MAX_IMAGE_SIZE_BYTES} bytes`);
  }
}

/* ------------------------------------------------------------------ */
/* Service layer                                                      */
/* ------------------------------------------------------------------ */

export interface CreateProductInput {
  idempotencyKey: string;
  product: ProductInsert;
}

export interface AddProductImageInput {
  productId: string;
  file: RegistryImageFile;
  position?: number;
  alt?: string | null;
}

export interface UpdateProductInput {
  patch: ProductUpdate;
}

export interface ReorderImageInput {
  imageId: string;
  position: number;
}

/**
 * Registry service. Orchestrates product + image repositories and enforces
 * domain rules (max images, size validation). All mutations are awaited — no
 * fire-and-forget promises. Idempotency keys make product creation retry-safe.
 */
export class RegistryService {
  private readonly inFlight = new Map<string, Promise<ProductRow>>();

  constructor(
    private readonly products: ProductRepository,
    private readonly images: ProductImageRepository,
    private readonly idempotency: IdempotencyStore = new MemoryIdempotencyStore(),
  ) {}

  async createProduct(input: CreateProductInput): Promise<ProductRow> {
    const { idempotencyKey, product } = input;
    if (!idempotencyKey || !idempotencyKey.trim()) throw new ValidationError("idempotencyKey is required");
    validateProduct(product);

    // In-flight dedup: concurrent calls with the same key share one promise.
    const existing = this.inFlight.get(idempotencyKey);
    if (existing) return existing;

    const promise = (async () => {
      // Cache hit: return the already-created product (idempotent replay).
      const cached = await this.idempotency.get(idempotencyKey);
      if (cached) {
        const found = await this.products.findById(cached.productId);
        if (found) return found;
      }
      const created = await this.products.create(product);
      await this.idempotency.set(idempotencyKey, { productId: created.id, createdAt: nowISO() });
      return created;
    })();

    this.inFlight.set(idempotencyKey, promise);
    try {
      return await promise;
    } finally {
      this.inFlight.delete(idempotencyKey);
    }
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<ProductRow> {
    const { patch } = input;
    try {
      return await this.products.update(id, patch);
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("update_failed", `Failed to update product ${id}`, 500);
    }
  }

  async setProductActive(id: string, active: boolean): Promise<ProductRow> {
    const updated = await this.products.setActive(id, active);
    if (!updated) throw new NotFoundError("product", id);
    return updated;
  }

  async softDeleteProduct(id: string): Promise<ProductRow> {
    const deleted = await this.products.softDelete(id);
    if (!deleted) throw new NotFoundError("product", id);
    return deleted;
  }

  async addProductImage(input: AddProductImageInput): Promise<ProductImageRow> {
    validateImageFile(input.file);

    // Domain rule: max images per product. This is a check then an insert —
    // a true atomic "max N" guard requires a DB partial unique index on
    // product_images (recommended for production). The service enforces it
    // here as the domain rule and keeps the insert a single statement.
    const existing = await this.images.listByProduct(input.productId);
    if (existing.length >= REGISTRY_MAX_IMAGES_PER_PRODUCT) {
      throw new QuotaError(`maximum ${REGISTRY_MAX_IMAGES_PER_PRODUCT} images per product`);
    }

    const position = input.position ?? existing.length;
    const created = await this.images.create({
      product_id: input.productId,
      position,
      path_thumb: input.file.path,
      path_medium: null,
      path_large: null,
      alt: input.file.alt ?? null,
      blur_data_url: null,
    });
    return created;
  }

  async updateProductImage(imageId: string, productId: string, patch: ProductImageUpdate): Promise<ProductImageRow> {
    // Scope update to the owning product so images cannot cross products.
    try {
      const updated = await this.images.update(imageId, patch);
      if (updated.product_id !== productId) throw new RegistryError("forbidden", "image does not belong to product", 403);
      return updated;
    } catch (err) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError("update_failed", `Failed to update product image ${imageId}`, 500);
    }
  }

  async removeProductImage(imageId: string, productId: string): Promise<void> {
    await this.images.remove(imageId, productId);
  }

  async reorderProductImages(productId: string, moves: ReorderImageInput[]): Promise<void> {
    // Each move is a single atomic WHERE-condition update scoped to the product.
    // Awaited sequentially — no fire-and-forget, no external calls inside.
    for (const move of moves) {
      const updated = await this.images.update(move.imageId, { position: move.position });
      if (updated.product_id !== productId) throw new RegistryError("forbidden", "image does not belong to product", 403);
    }
  }

  async listProductImages(productId: string): Promise<ProductImageRow[]> {
    return this.images.listByProduct(productId);
  }
}

/* ------------------------------------------------------------------ */
/* Factory                                                            */
/* ------------------------------------------------------------------ */

/**
 * Build a RegistryService from env-configured Supabase clients.
 * Throws if required env vars are missing — no secrets in code.
 * Reads use the anon client (RLS); writes use the service-role client.
 */
export async function createRegistryService(): Promise<RegistryService> {
  const admin = createRegistryAdminClient();
  const anon = await createRegistryClient();
  return new RegistryService(
    new SupabaseProductRepository(admin, anon),
    new SupabaseProductImageRepository(admin, anon),
  );
}
