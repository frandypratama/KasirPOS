import { ProductInput } from "./product";

export type FormErrors = Partial<Record<keyof ProductInput, string>>;
