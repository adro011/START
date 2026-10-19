import { LanguageSwitch } from "@/components/language-switch";
import { getRegistryLocale } from "./registry-locale";

/**
 * The storefront's BN / ENG pill, rendered inside the registry chrome so staff
 * switch language exactly the way shoppers do (cookie + server re-render).
 */
export default async function RegistryLanguageSwitch() {
  const locale = await getRegistryLocale();
  return <LanguageSwitch locale={locale} />;
}
