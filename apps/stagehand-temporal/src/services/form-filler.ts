import { Stagehand } from "@browserbasehq/stagehand";
import { observeWithCache } from "../utils";

/**
 * Interface for form field mapping configuration
 */
export interface FieldMappingConfig {
  [key: string]: string[];
}

/**
 * Default field mappings for common form fields
 */
export const defaultFieldMappings: FieldMappingConfig = {
  firstName: ["first name", "firstname", "given name"],
  lastName: ["last name", "lastname", "surname", "family name"],
  city: ["city", "town", "municipality"],
  state: ["state", "province", "region"]
};

/**
 * Creates a mapping function that maps form field descriptions to data fields
 * 
 * @param customMappings - Optional custom mappings to override or extend the default mappings
 * @returns A function that maps field descriptions to data keys
 */
export function createFieldMapper(customMappings?: FieldMappingConfig) {
  const mappings = customMappings ? { ...defaultFieldMappings, ...customMappings } : defaultFieldMappings;

  return (description: string): string | null => {
    for (const [key, terms] of Object.entries(mappings)) {
      if (terms.some(term => description.toLowerCase().includes(term))) {
        return key;
      }
    }
    return null;
  };
}

/**
 * Maps observed form fields to data values and updates the fields with the appropriate values
 *
 * @param page
 * @param data - The data object containing values to fill in the form (can be a DataSheet or a generic object with string values)
 * @param customMappings - Optional custom mappings to override or extend the default mappings
 * @returns The updated form fields with values from the data object
 */
export async function mapFormFields(
  page: Stagehand['page'],
  data: { [key: string]: string },
  customMappings?: FieldMappingConfig
) {
  // Create the field mapper function
  const fieldMapper = createFieldMapper(customMappings);

  // Observe all available form fields with caching
  const formFields = await observeWithCache(
    page,
    `get the text inputs on the page and match them against the values we have available as the argument: ${Object.keys(data)}`
  );

  // Log the observed fields
  console.log('Observed form fields:');
  formFields.forEach(field => console.log(`${field.description} -> ${field.selector}`));

  // Map the observed fields to the correct data
  const updatedFields = formFields.map(candidate => {
    const key = fieldMapper(candidate.description);
    if (key && data[key]) {
      candidate.arguments = [data[key]];
    }
    return candidate;
  });

  // Log the fields to be filled
  console.log('Fields to be filled:');
  updatedFields.forEach(field => console.log(`${field.description} -> ${field.arguments?.[0] || "no value"}`));

  return updatedFields;
}

/**
 * Fills form fields with mapped values
 * 
 * @param page - The Stagehand page object
 * @param data - The data object containing values to fill in the form (can be a DataSheet or a generic object with string values)
 * @param customMappings - Optional custom mappings to override or extend the default mappings
 */
export async function fillFormFields(
  page: Stagehand['page'],
  data: { [key: string]: string },
  customMappings?: FieldMappingConfig
) {
  const updatedFields = await mapFormFields(page, data, customMappings);

  // Fill all the form fields with the mapped values
  for (const field of updatedFields) {
    await page.act(field);
  }
}
