import { en, type Dict } from "./en";

export type Locale = "en";

/** Returns the dictionary for a locale. Only English exists today; te and hi will be added here. */
export function getDict(locale: Locale = "en"): Dict {
  void locale;
  return en;
}

export const dict: Dict = getDict();
