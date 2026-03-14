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
  if (!row) return mockCarrier

  // Extract fmcsa_raw data as fallback source
  const raw = (row.fmcsa_raw || {}) as Record<string, unknown>
  const rawAddr = (raw.physicalAddress || {}) as Record<string, string>
  const rawIns = (raw.insuranceData || {}) as Record<string, unknown>
  const rawCargo = (raw.cargoCarried || []) as string[]

  const eq = (row.equipment || {}) as Record<string, number>

  return {
    legalName: row.legal_name || mockCarrier.legalName,
    dbaName: row.dba_name || (raw.dbaName as string) || mockCarrier.dbaName,
    mcNumber: row.mc_number ? `MC-${row.mc_number}` : mockCarrier.mcNumber,
    dotNumber: row.dot_number || mockCarrier.dotNumber,
    entityType: row.entity_type || (raw.entityType as string) || mockCarrier.entityType,
    operatingStatus: row.operating_status || (raw.operatingStatus as string) || mockCarrier.operatingStatus,
    outOfServiceDate: null,
    address: {
      street: row.address_street || rawAddr.street || mockCarrier.address.street,
      city: row.address_city || rawAddr.city || mockCarrier.address.city,
      state: row.address_state || rawAddr.state || mockCarrier.address.state,
      zip: row.address_zip || rawAddr.zip || mockCarrier.address.zip,
    },
    phone: row.phone || (raw.phone as string) || mockCarrier.phone,
    email: row.email || mockCarrier.email,
    mailingAddress: {
      street: row.mailing_street || mockCarrier.mailingAddress.street,
      city: row.mailing_city || mockCarrier.mailingAddress.city,
      state: row.mailing_state || mockCarrier.mailingAddress.state,
      zip: row.mailing_zip || mockCarrier.mailingAddress.zip,
    },
    safetyRating: row.safety_rating || (raw.safetyRating as string) || mockCarrier.safetyRating,
    safetyRatingDate: row.safety_rating_date || mockCarrier.safetyRatingDate,
    totalDrivers: row.total_drivers ?? (raw.drivers as number) ?? mockCarrier.totalDrivers,
    totalPowerUnits: row.total_power_units ?? (raw.powerUnits as number) ?? mockCarrier.totalPowerUnits,
    operationClassification: row.operation_classification || mockCarrier.operationClassification,
    carrierOperation: row.carrier_operation || mockCarrier.carrierOperation,
    cargoCarried: row.cargo_carried || (rawCargo.length > 0 ? rawCargo : null) || mockCarrier.cargoCarried,
    insurance: {
      bipdRequired: row.bipd_required ?? (Number(rawIns.bipdRequired) || mockCarrier.insurance.bipdRequired),
      bipdOnFile: row.bipd_on_file ?? (Number(rawIns.bipdOnFile) || mockCarrier.insurance.bipdOnFile),
      bipdInsurer: row.bipd_insurer || String(rawIns.bipdInsurer || '') || mockCarrier.insurance.bipdInsurer,
      bipdPolicyNumber: row.bipd_policy_number || mockCarrier.insurance.bipdPolicyNumber,
      cargoRequired: row.cargo_required ?? (Number(rawIns.cargoRequired) || mockCarrier.insurance.cargoRequired),
      cargoOnFile: row.cargo_on_file ?? (Number(rawIns.cargoOnFile) || mockCarrier.insurance.cargoOnFile),
      cargoInsurer: row.cargo_insurer || String(rawIns.cargoInsurer || '') || mockCarrier.insurance.cargoInsurer,
      cargoPolicyNumber: row.cargo_policy_number || mockCarrier.insurance.cargoPolicyNumber,
      bondRequired: row.bond_required ?? mockCarrier.insurance.bondRequired,
      bondOnFile: row.bond_on_file ?? (Number(rawIns.bondOnFile) || mockCarrier.insurance.bondOnFile),
    },
    inspections: {
      vehicleTotal: row.vehicle_inspections_total ?? mockCarrier.inspections.vehicleTotal,
      vehicleOos: row.vehicle_inspections_oos ?? mockCarrier.inspections.vehicleOos,
      vehicleOosRate: row.vehicle_inspections_total != null
        ? oosRate(row.vehicle_inspections_total, row.vehicle_inspections_oos)
        : mockCarrier.inspections.vehicleOosRate,
      driverTotal: row.driver_inspections_total ?? mockCarrier.inspections.driverTotal,
      driverOos: row.driver_inspections_oos ?? mockCarrier.inspections.driverOos,
      driverOosRate: row.driver_inspections_total != null
        ? oosRate(row.driver_inspections_total, row.driver_inspections_oos)
        : mockCarrier.inspections.driverOosRate,
      hazmatTotal: row.hazmat_inspections_total ?? mockCarrier.inspections.hazmatTotal,
      hazmatOos: row.hazmat_inspections_oos ?? mockCarrier.inspections.hazmatOos,
      hazmatOosRate: row.hazmat_inspections_total != null
        ? oosRate(row.hazmat_inspections_total, row.hazmat_inspections_oos)
        : mockCarrier.inspections.hazmatOosRate,
    },
    crashes: {
      fatal: row.crashes_fatal ?? mockCarrier.crashes.fatal,
      injury: row.crashes_injury ?? mockCarrier.crashes.injury,
      towaway: row.crashes_towaway ?? mockCarrier.crashes.towaway,
      total: (row.crashes_fatal ?? 0) + (row.crashes_injury ?? 0) + (row.crashes_towaway ?? 0) || mockCarrier.crashes.total,
    },
    equipment: {
      straightTrucks: eq.straightTrucks ?? mockCarrier.equipment.straightTrucks,
      tractorTrailers: eq.tractorTrailers ?? mockCarrier.equipment.tractorTrailers,
      flatbeds: eq.flatbeds ?? mockCarrier.equipment.flatbeds,
      reefers: eq.reefers ?? mockCarrier.equipment.reefers,
      tankers: eq.tankers ?? mockCarrier.equipment.tankers,
      intermodal: eq.intermodal ?? mockCarrier.equipment.intermodal,
    },
    serviceLanes: row.service_lanes || mockCarrier.serviceLanes,
    companyDescription: row.company_description || mockCarrier.companyDescription,
    logoUrl: row.logo_url || null,
    brandColor: row.brand_color || mockCarrier.brandColor,
    websiteSlug: row.website_slug || mockCarrier.websiteSlug,
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
