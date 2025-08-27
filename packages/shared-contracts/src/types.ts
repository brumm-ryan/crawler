import { z } from "zod";

// Address types
export interface AddressCreate {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface AddressRead extends AddressCreate {
  id: number;
}

// Phone types
export interface PhoneCreate {
  number: string;
  type?: string;
}

export interface PhoneRead extends PhoneCreate {
  id: number;
}

// Email types
export interface EmailCreate {
  address: string;
  type?: string;
}

export interface EmailRead extends EmailCreate {
  id: number;
}

// Datasheet types
export interface DatasheetCreate {
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  userId?: number;
  addresses: AddressCreate[];
  phones: PhoneCreate[];
  emails: EmailCreate[];
}

export interface DatasheetRead extends DatasheetCreate {
  id: number;
}

// Base type for form data that matches fillFormFields parameter type
export interface FormData {
  [key: string]: string;
}

// DataSheet inherits from FormData to be compatible with fillFormFields
export interface DataSheet extends FormData {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
}

// Zod schemas for validation
export const ListingSchema = z.object({
  names: z.array(z.object({ name: z.string() })),
  ages: z.array(z.object({ age: z.string() })),
  addresses: z.array(z.object({ address: z.string() })),
  phones: z.array(z.object({ phone: z.string() })),
  emails: z.array(z.object({ email: z.string() })),
  relatives: z.array(z.object({ name: z.string() }))
});

export const SiteResultsSchema = z.object({
  url: z.string(),
  listings: z.array(ListingSchema)
});

export type Listing = z.infer<typeof ListingSchema>;
export type SiteResults = z.infer<typeof SiteResultsSchema>;