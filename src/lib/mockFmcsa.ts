export interface CarrierData {
  legalName: string
  dbaName: string
  mcNumber: string
  dotNumber: string
  entityType: string
  operatingStatus: string
  outOfServiceDate: string | null
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  phone: string
  email: string
  mailingAddress: {
    street: string
    city: string
    state: string
    zip: string
  }
  safetyRating: string
  safetyRatingDate: string
  totalDrivers: number
  totalPowerUnits: number
  operationClassification: string[]
  carrierOperation: string[]
  cargoCarried: string[]
  insurance: {
    bipdRequired: number
    bipdOnFile: number
    cargoRequired: number
    cargoOnFile: number
    bondRequired: number
    bondOnFile: number
    bipdPolicyNumber: string
    bipdInsurer: string
    cargoPolicyNumber: string
    cargoInsurer: string
  }
  inspections: {
    vehicleTotal: number
    vehicleOos: number
    vehicleOosRate: number
    driverTotal: number
    driverOos: number
    driverOosRate: number
    hazmatTotal: number
    hazmatOos: number
    hazmatOosRate: number
  }
  crashes: {
    fatal: number
    injury: number
    towaway: number
    total: number
  }
  equipment: {
    straightTrucks: number
    tractorTrailers: number
    flatbeds: number
    reefers: number
    tankers: number
    intermodal: number
  }
  serviceLanes: string[]
  companyDescription: string
  logoUrl: string | null
  brandColor: string
  websiteSlug: string
}

export const mockCarrier: CarrierData = {
  legalName: 'LONE STAR EXPRESS LLC',
  dbaName: 'Lone Star Freight',
  mcNumber: 'MC-1781606',
  dotNumber: '4192847',
  entityType: 'CARRIER',
  operatingStatus: 'AUTHORIZED FOR Property',
  outOfServiceDate: null,
  address: {
    street: '4821 Cedar Springs Rd, Suite 200',
    city: 'Dallas',
    state: 'TX',
    zip: '75219',
  },
  phone: '(214) 555-0187',
  email: 'dispatch@lonestarfreight.com',
  mailingAddress: {
    street: 'PO Box 741025',
    city: 'Dallas',
    state: 'TX',
    zip: '75374',
  },
  safetyRating: 'Satisfactory',
  safetyRatingDate: '2024-08-15',
  totalDrivers: 24,
  totalPowerUnits: 18,
  operationClassification: ['Authorized For Hire', 'Interstate'],
  carrierOperation: ['Truckload (TL)', 'Less Than Truckload (LTL)'],
  cargoCarried: [
    'General Freight',
    'Household Goods',
    'Metal: Sheets, Coils, Rolls',
    'Building Materials',
    'Machinery, Large Objects',
    'Fresh Produce',
    'Refrigerated Food',
    'Beverages',
    'Paper Products',
    'Chemicals',
  ],
  insurance: {
    bipdRequired: 750000,
    bipdOnFile: 1000000,
    cargoRequired: 100000,
    cargoOnFile: 250000,
    bondRequired: 75000,
    bondOnFile: 75000,
    bipdPolicyNumber: 'BPD-2024-881742',
    bipdInsurer: 'National Interstate Insurance Co.',
    cargoPolicyNumber: 'CRG-2024-553291',
    cargoInsurer: 'Great West Casualty Company',
  },
  inspections: {
    vehicleTotal: 47,
    vehicleOos: 3,
    vehicleOosRate: 6.4,
    driverTotal: 52,
    driverOos: 2,
    driverOosRate: 3.8,
    hazmatTotal: 0,
    hazmatOos: 0,
    hazmatOosRate: 0,
  },
  crashes: {
    fatal: 0,
    injury: 1,
    towaway: 2,
    total: 3,
  },
  equipment: {
    straightTrucks: 4,
    tractorTrailers: 10,
    flatbeds: 2,
    reefers: 2,
    tankers: 0,
    intermodal: 0,
  },
  serviceLanes: [
    'Texas to California',
    'Texas to Florida',
    'Midwest to Southeast',
    'Cross-Country (48 States)',
  ],
  companyDescription:
    'Lone Star Express LLC is a Dallas-based carrier specializing in full truckload and LTL services across the continental United States. With a fleet of 18 power units and 24 experienced drivers, we deliver reliable, on-time freight solutions for general commodities, refrigerated goods, and oversized loads. Our Satisfactory safety rating and low out-of-service rates reflect our commitment to safety and compliance.',
  logoUrl: null,
  brandColor: '#f97316',
  websiteSlug: 'lone-star-freight',
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getSafetyRatingColor(rating: string): { bg: string; text: string; label: string } {
  switch (rating.toLowerCase()) {
    case 'satisfactory':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Satisfactory' }
    case 'conditional':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Conditional' }
    case 'unsatisfactory':
      return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Unsatisfactory' }
    default:
      return { bg: 'bg-gray-500/10', text: 'text-gray-400', label: rating || 'Not Rated' }
  }
}
