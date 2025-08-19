/**
 * TypeScript types corresponding to the read/write models in the crawler-api project.
 * These types match the Python models in app/models/datasheets.py.
 */

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
  user_id?: number;
  addresses: AddressCreate[];
  phones: PhoneCreate[];
  emails: EmailCreate[];
}

export interface DatasheetRead extends DatasheetCreate {
  id: number;
}