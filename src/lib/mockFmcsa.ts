import type { Carrier } from '../hooks/useAuth'

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

function oosRate(total: number | null | undefined, oos: number | null | undefined): number {
  const t = total ?? 0
  const o = oos ?? 0
  return t > 0 ? Math.round((o / t) * 1000) / 10 : 0
}

// Build a CarrierData display object from a carriers DB row.
// Reads from individual columns first, falls back to fmcsa_raw, then to mockCarrier.
export function buildCarrierDisplay(row: Carrier | null): CarrierData {
  if (!row) return { ...mockCarrier }

  try {
    // Extract fmcsa_raw data as fallback source — guard against unexpected shapes
    const raw = (row.fmcsa_raw && typeof row.fmcsa_raw === 'object' ? row.fmcsa_raw : {}) as Record<string, unknown>
    const rawAddr = (raw.physicalAddress && typeof raw.physicalAddress === 'object' ? raw.physicalAddress : {}) as Record<string, string>
    const rawIns = (raw.insuranceData && typeof raw.insuranceData === 'object' ? raw.insuranceData : {}) as Record<string, unknown>
    const rawCargo = Array.isArray(raw.cargoCarried) ? (raw.cargoCarried as string[]) : []
    const rawDesc = typeof raw.companyDescription === 'string' ? raw.companyDescription : ''

    const eq = (row.equipment && typeof row.equipment === 'object' ? row.equipment : {}) as Record<string, number>

    return {
      legalName: row.legal_name || '',
      dbaName: row.dba_name || (typeof raw.dbaName === 'string' ? raw.dbaName : '') || '',
      mcNumber: row.mc_number ? `MC-${row.mc_number}` : '',
      dotNumber: row.dot_number || '',
      entityType: row.entity_type || (typeof raw.entityType === 'string' ? raw.entityType : '') || '',
      operatingStatus: row.operating_status || (typeof raw.operatingStatus === 'string' ? raw.operatingStatus : '') || 'Unknown',
      outOfServiceDate: null,
      address: {
        street: row.address_street || rawAddr.street || '',
        city: row.address_city || rawAddr.city || '',
        state: row.address_state || rawAddr.state || '',
        zip: row.address_zip || rawAddr.zip || '',
      },
      phone: row.phone || (typeof raw.phone === 'string' ? raw.phone : '') || '',
      email: row.email || '',
      mailingAddress: {
        street: row.mailing_street || '',
        city: row.mailing_city || '',
        state: row.mailing_state || '',
        zip: row.mailing_zip || '',
      },
      safetyRating: row.safety_rating || (typeof raw.safetyRating === 'string' ? raw.safetyRating : '') || 'Not Rated',
      safetyRatingDate: row.safety_rating_date || '',
      totalDrivers: row.total_drivers ?? (typeof raw.drivers === 'number' ? raw.drivers : 0),
      totalPowerUnits: row.total_power_units ?? (typeof raw.powerUnits === 'number' ? raw.powerUnits : 0),
      operationClassification: Array.isArray(row.operation_classification) ? row.operation_classification : [],
      carrierOperation: Array.isArray(row.carrier_operation) ? row.carrier_operation : [],
      cargoCarried: Array.isArray(row.cargo_carried) && row.cargo_carried.length > 0
        ? row.cargo_carried
        : rawCargo.length > 0 ? rawCargo : [],
      insurance: {
        bipdRequired: row.bipd_required ?? (Number(rawIns.bipdRequired) || 0),
        bipdOnFile: row.bipd_on_file ?? (Number(rawIns.bipdOnFile) || 0),
        bipdInsurer: row.bipd_insurer || String(rawIns.bipdInsurer || '') || '',
        bipdPolicyNumber: row.bipd_policy_number || '',
        cargoRequired: row.cargo_required ?? (Number(rawIns.cargoRequired) || 0),
        cargoOnFile: row.cargo_on_file ?? (Number(rawIns.cargoOnFile) || 0),
        cargoInsurer: row.cargo_insurer || String(rawIns.cargoInsurer || '') || '',
        cargoPolicyNumber: row.cargo_policy_number || '',
        bondRequired: row.bond_required ?? 0,
        bondOnFile: row.bond_on_file ?? (Number(rawIns.bondOnFile) || 0),
      },
      inspections: {
        vehicleTotal: row.vehicle_inspections_total ?? 0,
        vehicleOos: row.vehicle_inspections_oos ?? 0,
        vehicleOosRate: oosRate(row.vehicle_inspections_total, row.vehicle_inspections_oos),
        driverTotal: row.driver_inspections_total ?? 0,
        driverOos: row.driver_inspections_oos ?? 0,
        driverOosRate: oosRate(row.driver_inspections_total, row.driver_inspections_oos),
        hazmatTotal: row.hazmat_inspections_total ?? 0,
        hazmatOos: row.hazmat_inspections_oos ?? 0,
        hazmatOosRate: oosRate(row.hazmat_inspections_total, row.hazmat_inspections_oos),
      },
      crashes: {
        fatal: row.crashes_fatal ?? 0,
        injury: row.crashes_injury ?? 0,
        towaway: row.crashes_towaway ?? 0,
        total: (row.crashes_fatal ?? 0) + (row.crashes_injury ?? 0) + (row.crashes_towaway ?? 0),
      },
      equipment: {
        straightTrucks: eq.straightTrucks ?? 0,
        tractorTrailers: eq.tractorTrailers ?? 0,
        flatbeds: eq.flatbeds ?? 0,
        reefers: eq.reefers ?? 0,
        tankers: eq.tankers ?? 0,
        intermodal: eq.intermodal ?? 0,
      },
      serviceLanes: Array.isArray(row.service_lanes) && row.service_lanes.length > 0 ? row.service_lanes : [],
      companyDescription: row.company_description || rawDesc || '',
      logoUrl: row.logo_url || null,
      brandColor: row.brand_color || (typeof raw.brandColor === 'string' ? raw.brandColor : '') || '#f97316',
      websiteSlug: row.website_slug || '',
    }
  } catch {
    // If anything goes wrong parsing carrier data, fall back to mock
    return { ...mockCarrier, legalName: row.legal_name || mockCarrier.legalName }
  }
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
