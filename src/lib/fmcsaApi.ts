const BASE_URL = 'https://mobile.fmcsa.dot.gov/qc/services'
const API_KEY = import.meta.env.VITE_FMCSA_API_KEY || ''

export interface FmcsaCarrier {
  legalName: string
  dbaName: string
  dotNumber: string
  mcNumber: string
  operatingStatus: string
  safetyRating: string
  physicalAddress: {
    street: string
    city: string
    state: string
    zip: string
  }
  phone: string
  powerUnits: number
  drivers: number
  insuranceData: {
    bipdRequired: number
    bipdOnFile: number
    bipdInsurer: string
    cargoRequired: number
    cargoOnFile: number
    cargoInsurer: string
    bondOnFile: number
  }
  boc3OnFile: boolean
  cargoCarried: string[]
  basicsScores: Record<string, number>
  entityType: string
}

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`FMCSA API error: ${res.status}`)
  }
  return res.json()
}

function parseCarrierData(data: Record<string, unknown>): Partial<FmcsaCarrier> {
  // The API nests carrier info under content[0].carrier
  const content = data.content as Record<string, unknown>[] | undefined
  const carrier = (content?.[0] as Record<string, unknown>)?.carrier as Record<string, unknown> | undefined

  if (!carrier) {
    throw new Error('Carrier not found')
  }

  return {
    legalName: (carrier.legalName as string) || '',
    dbaName: (carrier.dbaName as string) || '',
    dotNumber: String(carrier.dotNumber || ''),
    mcNumber: String(carrier.mcNumber || carrier.docketNumber || ''),
    operatingStatus: (carrier.allowedToOperate as string) === 'Y' ? 'Authorized' : (carrier.operatingStatus as string) || 'Unknown',
    safetyRating: (carrier.safetyRating as string) || 'Not Rated',
    physicalAddress: {
      street: (carrier.phyStreet as string) || '',
      city: (carrier.phyCity as string) || '',
      state: (carrier.phyState as string) || '',
      zip: (carrier.phyZipcode as string) || '',
    },
    phone: (carrier.telephone as string) || '',
    powerUnits: Number(carrier.totalPowerUnits) || 0,
    drivers: Number(carrier.totalDrivers) || 0,
    insuranceData: {
      bipdRequired: Number(carrier.bipdRequiredAmount) || 0,
      bipdOnFile: Number(carrier.bipdInsuranceOnFile) || 0,
      bipdInsurer: (carrier.bipdInsuranceRequired as string) || '',
      cargoRequired: Number(carrier.cargoInsuranceRequired) || 0,
      cargoOnFile: Number(carrier.cargoInsuranceOnFile) || 0,
      cargoInsurer: '',
      bondOnFile: Number(carrier.bondInsuranceOnFile) || 0,
    },
    boc3OnFile: (carrier.boc3FilingDate as string) ? true : false,
    entityType: (carrier.carrierOperation as string) || (carrier.entityType as string) || '',
  }
}

function parseCargoCarried(data: Record<string, unknown>): string[] {
  const content = data.content as Record<string, unknown>[] | undefined
  if (!content || !Array.isArray(content)) return []
  return content
    .map((item) => (item.cargoClassDesc as string) || (item.cargoCarriedDesc as string) || '')
    .filter(Boolean)
}

function parseBasicsScores(data: Record<string, unknown>): Record<string, number> {
  const content = data.content as Record<string, unknown>[] | undefined
  if (!content || !Array.isArray(content)) return {}
  const scores: Record<string, number> = {}
  for (const item of content) {
    const name = (item.basicsDescription as string) || (item.basicsType as string) || ''
    const score = Number(item.basicsValue ?? item.score ?? 0)
    if (name) scores[name] = score
  }
  return scores
}

export async function lookupByMcNumber(mcNumber: string): Promise<FmcsaCarrier> {
  const cleanMc = mcNumber.replace(/\D/g, '')
  if (!cleanMc) throw new Error('Invalid MC number')

  // Step 1: Look up by MC/docket number to get DOT number
  const mcData = await fetchJson(
    `${BASE_URL}/carriers/docket-number/${cleanMc}?webKey=${API_KEY}`
  )

  const partial = parseCarrierData(mcData)
  if (!partial.dotNumber) {
    throw new Error('Carrier not found')
  }

  // Step 2: Fetch cargo and BASICS in parallel using DOT number
  const [cargoData, basicsData] = await Promise.allSettled([
    fetchJson(`${BASE_URL}/carriers/${partial.dotNumber}/cargo-carried?webKey=${API_KEY}`),
    fetchJson(`${BASE_URL}/carriers/${partial.dotNumber}/basics?webKey=${API_KEY}`),
  ])

  const cargoCarried = cargoData.status === 'fulfilled' ? parseCargoCarried(cargoData.value) : []
  const basicsScores = basicsData.status === 'fulfilled' ? parseBasicsScores(basicsData.value) : {}

  return {
    legalName: partial.legalName || '',
    dbaName: partial.dbaName || '',
    dotNumber: partial.dotNumber,
    mcNumber: cleanMc,
    operatingStatus: partial.operatingStatus || 'Unknown',
    safetyRating: partial.safetyRating || 'Not Rated',
    physicalAddress: partial.physicalAddress || { street: '', city: '', state: '', zip: '' },
    phone: partial.phone || '',
    powerUnits: partial.powerUnits || 0,
    drivers: partial.drivers || 0,
    insuranceData: partial.insuranceData || {
      bipdRequired: 0, bipdOnFile: 0, bipdInsurer: '',
      cargoRequired: 0, cargoOnFile: 0, cargoInsurer: '', bondOnFile: 0,
    },
    boc3OnFile: partial.boc3OnFile || false,
    cargoCarried,
    basicsScores,
    entityType: partial.entityType || '',
  }
}

export async function lookupByDotNumber(dotNumber: string): Promise<FmcsaCarrier> {
  const cleanDot = dotNumber.replace(/\D/g, '')
  if (!cleanDot) throw new Error('Invalid DOT number')

  // Fetch carrier, cargo, and BASICS in parallel
  const [carrierData, cargoData, basicsData] = await Promise.allSettled([
    fetchJson(`${BASE_URL}/carriers/${cleanDot}?webKey=${API_KEY}`),
    fetchJson(`${BASE_URL}/carriers/${cleanDot}/cargo-carried?webKey=${API_KEY}`),
    fetchJson(`${BASE_URL}/carriers/${cleanDot}/basics?webKey=${API_KEY}`),
  ])

  if (carrierData.status === 'rejected') {
    throw new Error('Carrier not found')
  }

  const partial = parseCarrierData(carrierData.value)
  const cargoCarried = cargoData.status === 'fulfilled' ? parseCargoCarried(cargoData.value) : []
  const basicsScores = basicsData.status === 'fulfilled' ? parseBasicsScores(basicsData.value) : {}

  return {
    legalName: partial.legalName || '',
    dbaName: partial.dbaName || '',
    dotNumber: cleanDot,
    mcNumber: partial.mcNumber || '',
    operatingStatus: partial.operatingStatus || 'Unknown',
    safetyRating: partial.safetyRating || 'Not Rated',
    physicalAddress: partial.physicalAddress || { street: '', city: '', state: '', zip: '' },
    phone: partial.phone || '',
    powerUnits: partial.powerUnits || 0,
    drivers: partial.drivers || 0,
    insuranceData: partial.insuranceData || {
      bipdRequired: 0, bipdOnFile: 0, bipdInsurer: '',
      cargoRequired: 0, cargoOnFile: 0, cargoInsurer: '', bondOnFile: 0,
    },
    boc3OnFile: partial.boc3OnFile || false,
    cargoCarried,
    basicsScores,
    entityType: partial.entityType || '',
  }
}
