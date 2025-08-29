import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import type { AddressCreate, EmailCreate, PhoneCreate, DatasheetCreate } from '@/lib/types.ts'
import { useDatasheets, useCreateDatasheet, useDeleteDatasheet } from '../../lib/queries'

export const Route = createFileRoute('/_authenticated/datasheet')({
  component: DatasheetPage,
})

function DatasheetPage() {
  const { 
    data: datasheets = [], 
    isLoading: loading, 
    error,
    refetch: loadDatasheets
  } = useDatasheets()
  
  const createDatasheetMutation = useCreateDatasheet()
  const deleteDatasheetMutation = useDeleteDatasheet()

  // Form data for the main datasheet
  const [formData, setFormData] = useState<DatasheetCreate>({
    addresses: [], emails: [], phones: [], userId: 0,
    firstName: '',
    middleName: '',
    lastName: '',
    age: 0
  })

  // Lists for multiple items
  const [addresses, setAddresses] = useState<AddressCreate[]>([])
  const [phones, setPhones] = useState<PhoneCreate[]>([])
  const [emails, setEmails] = useState<EmailCreate[]>([])

  // Current item being edited
  const [currentAddress, setCurrentAddress] = useState<AddressCreate>({ 
    street: '', city: '', state: '', zip_code: '' 
  })
  const [currentPhone, setCurrentPhone] = useState<PhoneCreate>({ 
    number: '', type: '' 
  })
  const [currentEmail, setCurrentEmail] = useState<EmailCreate>({ 
    address: '', type: '' 
  })

  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  // Handle changes to the main form data
  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }))
  }

  // Handle changes to the current address being edited
  const handleAddressChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setCurrentAddress(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle changes to the current phone being edited
  const handlePhoneChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setCurrentPhone(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle changes to the current email being edited
  const handleEmailChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setCurrentEmail(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Add the current address to the list
  const addAddress = () => {
    if (currentAddress.street && currentAddress.city && currentAddress.state && currentAddress.zip_code) {
      const updatedAddresses = [...addresses, { ...currentAddress }];
      setAddresses(updatedAddresses);
      setFormData(prevData => ({
        ...prevData,
        addresses: updatedAddresses
      }));
      setCurrentAddress({ street: '', city: '', state: '', zip_code: '' });
    }
  }

  // Add the current phone to the list
  const addPhone = () => {
    if (currentPhone.number) {
      const updatedPhones = [...phones, { ...currentPhone }];
      setPhones(updatedPhones);
      setFormData(prevData => ({
        ...prevData,
        phones: updatedPhones
      }));
      setCurrentPhone({ number: '', type: '' });
    }
  }

  // Add the current email to the list
  const addEmail = () => {
    if (currentEmail.address) {
      const updatedEmails = [...emails, { ...currentEmail }];
      setEmails(updatedEmails);
      setFormData(prevData => ({
        ...prevData,
        emails: updatedEmails
      }));
      setCurrentEmail({ address: '', type: '' });
    }
  }

  // Remove an address from the list
  const removeAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    setFormData(prevData => ({
      ...prevData,
      addresses: updatedAddresses
    }));
  }

  // Remove a phone from the list
  const removePhone = (index: number) => {
    const updatedPhones = phones.filter((_, i) => i !== index);
    setPhones(updatedPhones);
    setFormData(prevData => ({
      ...prevData,
      phones: updatedPhones
    }));
  }

  // Remove an email from the list
  const removeEmail = (index: number) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    setEmails(updatedEmails);
    setFormData(prevData => ({
      ...prevData,
      emails: updatedEmails
    }));
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    
    createDatasheetMutation.mutate(formData, {
      onSuccess: () => {
        // Reset the form
        const emptyFormData = {
          addresses: [], 
          emails: [], 
          phones: [], 
          userId: 0,
          firstName: '',
          middleName: '',
          lastName: '',
          age: 0,
        };

        setFormData(emptyFormData);
        setAddresses([]);
        setPhones([]);
        setEmails([]);

        // Reset current editing items
        setCurrentAddress({ street: '', city: '', state: '', zip_code: '' });
        setCurrentPhone({ number: '', type: '' });
        setCurrentEmail({ address: '', type: '' });

        setSubmitted(true)
        setShowForm(false) // Return to card view after submission
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this datasheet?')) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(id))
    
    deleteDatasheetMutation.mutate(id, {
      onSettled: () => {
        setDeletingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    })
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Personal Information Datasheet</h1>

      {/* Error Message */}
      {(error || createDatasheetMutation.error || deleteDatasheetMutation.error) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error!</p>
          <p>{error?.message || createDatasheetMutation.error?.message || deleteDatasheetMutation.error?.message || 'An error occurred'}</p>
          <button
            onClick={() => loadDatasheets()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success Message */}
      {submitted && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Success!</p>
          <p>Your personal information datasheet has been created.</p>
        </div>
      )}

      {/* Loading State */}
      {(loading || createDatasheetMutation.isPending) && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            <p>{createDatasheetMutation.isPending ? 'Creating datasheet...' : 'Loading...'}</p>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create Your Datasheet</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times; Cancel
            </button>
          </div>
          <p className="mb-4 text-gray-600">
            Please fill out the form below with your personal information. This information will be stored securely.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="A."
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Addresses */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Email Addresses</h3>
                {emails.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {emails.length} {emails.length === 1 ? 'email' : 'emails'} added
                  </span>
                )}
              </div>

              {/* Add new email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="address"
                    value={currentEmail.address}
                    onChange={handleEmailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="emailType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    id="emailType"
                    name="type"
                    value={currentEmail.type}
                    onChange={handleEmailChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Personal, Work, etc."
                  />
                </div>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={addEmail}
                  disabled={!currentEmail.address}
                  className={`mb-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                    currentEmail.address ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Email
                </button>
                {!currentEmail.address && (
                  <span className="ml-3 text-sm text-gray-500">Enter an email address to add</span>
                )}
              </div>

              {/* List of emails */}
              {emails.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Emails:</h4>
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                    {emails.map((email, index) => (
                      <li key={index} className="px-4 py-3 bg-white flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{email.address}</p>
                          {email.type && <p className="text-sm text-gray-500">{email.type}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEmail(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Phone Numbers */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Phone Numbers</h3>
                {phones.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {phones.length} {phones.length === 1 ? 'phone' : 'phones'} added
                  </span>
                )}
              </div>

              {/* Add new phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="number"
                    value={currentPhone.number}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="phoneType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    id="phoneType"
                    name="type"
                    value={currentPhone.type}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mobile, Home, Work, etc."
                  />
                </div>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={addPhone}
                  disabled={!currentPhone.number}
                  className={`mb-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                    currentPhone.number ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Phone
                </button>
                {!currentPhone.number && (
                  <span className="ml-3 text-sm text-gray-500">Enter a phone number to add</span>
                )}
              </div>

              {/* List of phones */}
              {phones.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Phone Numbers:</h4>
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                    {phones.map((phone, index) => (
                      <li key={index} className="px-4 py-3 bg-white flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{phone.number}</p>
                          {phone.type && <p className="text-sm text-gray-500">{phone.type}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhone(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
                {addresses.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} added
                  </span>
                )}
              </div>

              {/* Add new address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={currentAddress.street}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={currentAddress.city}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Anytown"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={currentAddress.state}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={currentAddress.zip_code}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={addAddress}
                  disabled={!(currentAddress.street && currentAddress.city && currentAddress.state && currentAddress.zip_code)}
                  className={`mb-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                    (currentAddress.street && currentAddress.city && currentAddress.state && currentAddress.zip_code) 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Address
                </button>
                {!(currentAddress.street && currentAddress.city && currentAddress.state && currentAddress.zip_code) && (
                  <span className="ml-3 text-sm text-gray-500">All address fields are required</span>
                )}
              </div>

              {/* List of addresses */}
              {addresses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Addresses:</h4>
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                    {addresses.map((address, index) => (
                      <li key={index} className="px-4 py-3 bg-white flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{address.street}</p>
                          <p className="text-sm text-gray-500">{address.city}, {address.state} {address.zip_code}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAddress(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={createDatasheetMutation.isPending}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  createDatasheetMutation.isPending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {createDatasheetMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Datasheet'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Datasheets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Create New Datasheet Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-4 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowForm(true)}
              style={{ minHeight: '200px' }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-center text-gray-700 font-medium">Create New Datasheet</p>
            </div>

            {/* Existing Datasheets */}
            {datasheets.map((datasheet) => (
              <div key={datasheet.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow relative">
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(datasheet.id)}
                  disabled={deletingIds.has(datasheet.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Delete datasheet"
                >
                  {deletingIds.has(datasheet.id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>

                <h3 className="font-semibold text-lg mb-2 pr-8">
                  {datasheet.firstName} {datasheet.middleName ? datasheet.middleName + ' ' : ''}{datasheet.lastName}
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><span className="font-medium">Age:</span> {datasheet.age}</p>

                  {datasheet.emails && datasheet.emails.length > 0 && (
                    <div>
                      <p className="font-medium">Emails:</p>
                      <ul className="pl-4 list-disc">
                        {datasheet.emails.map((email, index) => (
                          <li key={index}>
                            {email.address} {email.type && <span className="text-gray-500">({email.type})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {datasheet.phones && datasheet.phones.length > 0 && (
                    <div>
                      <p className="font-medium">Phones:</p>
                      <ul className="pl-4 list-disc">
                        {datasheet.phones.map((phone, index) => (
                          <li key={index}>
                            {phone.number} {phone.type && <span className="text-gray-500">({phone.type})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {datasheet.addresses && datasheet.addresses.length > 0 && (
                    <div>
                      <p className="font-medium">Addresses:</p>
                      <ul className="pl-4 list-disc">
                        {datasheet.addresses.map((address, index) => (
                          <li key={index}>
                            {address.street}, {address.city}, {address.state} {address.zip_code}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Privacy Information</h2>
        <p className="mb-4">
          We take your privacy seriously. All personal information submitted through this form is:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Encrypted during transmission and storage</li>
          <li>Only accessible to authorized personnel</li>
          <li>Never sold or shared with third parties</li>
          <li>Stored only as long as necessary for the purposes stated</li>
        </ul>
        <p className="text-sm text-gray-600">
          For more information, please review our Privacy Policy.
        </p>
      </div>
    </div>
  )
}
