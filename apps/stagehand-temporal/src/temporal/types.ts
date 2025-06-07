// Base type for form data that matches fillFormFields parameter type
import {z} from "zod";

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

export const ListingSchema = z.object({
    names: z.array(z.object({name: z.string()})),
    ages: z.array(z.object({age: z.string()})),
    addresses: z.array(z.object({address: z.string()})),
    phones: z.array(z.object({phone: z.string()})),
    emails: z.array(z.object({email: z.string()})),
    relatives: z.array(z.object({name : z.string()}))
});

export const SiteResultsSchema = z.object({
    url: z.string(),
    listings: z.array(ListingSchema)
})

export type Listing = z.infer<typeof ListingSchema>
export type SiteResults = z.infer<typeof SiteResultsSchema>

