import { z } from "zod";

export const registryProductTypeSchema = z.enum([
  "male",
  "female",
  "children",
  "adult",
  "others",
]);
export type RegistryProductType = z.infer<typeof registryProductTypeSchema>;
export const REGISTRY_PRODUCT_TYPES: readonly RegistryProductType[] = registryProductTypeSchema.options;

export const registryAgeCategorySchema = z.enum([
  "0-4",
  "4-6",
  "6-8",
  "8-10",
  "10-12",
  "12-14",
  "14-16",
  "16-19",
  "17-19",
  "ADULT",
]);
export type RegistryAgeCategory = z.infer<typeof registryAgeCategorySchema>;
export const REGISTRY_AGE_CATEGORIES: readonly RegistryAgeCategory[] = registryAgeCategorySchema.options;

export const registryClothingSizeSchema = z.enum(["S", "M", "L", "XL", "XXL", "XXXL"]);
export type RegistryClothingSize = z.infer<typeof registryClothingSizeSchema>;
export const REGISTRY_CLOTHING_SIZES: readonly RegistryClothingSize[] = registryClothingSizeSchema.options;

export const registryShoeSizeSchema = z.enum([
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
]);
export type RegistryShoeSize = z.infer<typeof registryShoeSizeSchema>;
export const REGISTRY_SHOE_SIZES: readonly RegistryShoeSize[] = registryShoeSizeSchema.options;

export const registryImageSchema = z.string().min(1).max(1000);
export const registryImagesSchema = z.array(registryImageSchema).max(5, "Maximum 5 images allowed");

export const registryProductBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must be at most 200 characters"),
  type: registryProductTypeSchema,
  ageCategory: registryAgeCategorySchema.optional(),
  size: z.string(),
  pricePaisa: z.number().int("Price must be a whole number").positive("Price must be positive"),
  description: z.string().min(1, "Description is required").max(5000, "Description must be at most 5000 characters"),
  images: registryImagesSchema,
  rating: z.number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),
});

export const registryProductInputSchema = registryProductBaseSchema
  .refine((data) => {
    const allowedSizes: readonly string[] =
      data.type === "others" ? REGISTRY_SHOE_SIZES : REGISTRY_CLOTHING_SIZES;
    return allowedSizes.includes(data.size);
  }, { message: "Invalid size for the selected product type", path: ["size"] })
  .refine((data) => {
    if (data.type === "male" || data.type === "female" || data.type === "children") {
      return data.ageCategory !== undefined;
    }
    return true;
  }, { message: "Age category is required for male, female and children", path: ["ageCategory"] });

export type RegistryProductInput = z.infer<typeof registryProductInputSchema>;

export function registryAllowedSizes(type: RegistryProductType): readonly string[] {
  return type === "others" ? REGISTRY_SHOE_SIZES : REGISTRY_CLOTHING_SIZES;
}

export function registryRequiresAgeCategory(type: RegistryProductType): type is "male" | "female" | "children" {
  return type === "male" || type === "female" || type === "children";
}

export function isValidRegistrySize(type: RegistryProductType, size: string): size is RegistryClothingSize | RegistryShoeSize {
  return registryAllowedSizes(type).includes(size as RegistryClothingSize | RegistryShoeSize);
}
