import { useState, useEffect, useRef } from 'react'
import {
  Save,
  Upload,
  Palette,
  FileText,
  MapPin,
  Image,
  Loader2,
  CheckCircle,
  Trash2,
  Plus,
  X,
  Phone,
  Mail,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Home,
  Globe,
  Copy,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { sanitizeText, sanitizeHexColor, sanitizeForDb } from '../lib/sanitize'

// Validate file magic bytes to prevent spoofed MIME types
async function validateFileMagic(file: File, allowedTypes: string[]): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  const signatures: Record<string, number[]> = {
    png: [0x89, 0x50, 0x4E, 0x47],       // .PNG
    jpg: [0xFF, 0xD8, 0xFF],              // JFIF/EXIF
    webp: [0x52, 0x49, 0x46, 0x46],       // RIFF (WebP container)
    pdf: [0x25, 0x50, 0x44, 0x46],        // %PDF
  }

  for (const type of allowedTypes) {
    const sig = signatures[type]
    if (!sig) continue
    if (sig.every((b, i) => bytes[i] === b)) return true
  }
  return false
}

interface DocRow {
  id: string
  name: string
  type: string
  file_url: string
  created_at: string
}

function Settings() {
  const { carrier, refreshCarrier, loading } = useAuth()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const fmcsaRaw = (carrier?.fmcsa_raw && typeof carrier.fmcsa_raw === 'object' ? carrier.fmcsa_raw : {}) as Record<string, unknown>
  const rawAddr = (fmcsaRaw.physicalAddress && typeof fmcsaRaw.physicalAddress === 'object' ? fmcsaRaw.physicalAddress : {}) as Record<string, string>
  const rawIns = (fmcsaRaw.insuranceData && typeof fmcsaRaw.insuranceData === 'object' ? fmcsaRaw.insuranceData : {}) as Record<string, unknown>
  const eq = (carrier?.equipment && typeof carrier.equipment === 'object' ? carrier.equipment : {}) as Record<string, number>

  // Company info
  const [heroText, setHeroText] = useState(carrier?.company_description || (typeof fmcsaRaw.companyDescription === 'string' ? fmcsaRaw.companyDescription : '') || '')
  const [primaryColor, setPrimaryColor] = useState(carrier?.brand_color || (typeof fmcsaRaw.brandColor === 'string' ? fmcsaRaw.brandColor : '') || '#f97316')
  const [logoUrl, setLogoUrl] = useState(carrier?.logo_url || '')
  const [email, setEmail] = useState(carrier?.email || '')
  const [phone, setPhone] = useState(carrier?.phone || (typeof fmcsaRaw.phone === 'string' ? fmcsaRaw.phone : '') || '')

  // Address
  const [addressStreet, setAddressStreet] = useState(carrier?.address_street || rawAddr.street || '')
  const [addressCity, setAddressCity] = useState(carrier?.address_city || rawAddr.city || '')
  const [addressState, setAddressState] = useState(carrier?.address_state || rawAddr.state || '')
  const [addressZip, setAddressZip] = useState(carrier?.address_zip || rawAddr.zip || '')
  const [mailingStreet, setMailingStreet] = useState(carrier?.mailing_street || '')
  const [mailingCity, setMailingCity] = useState(carrier?.mailing_city || '')
  const [mailingState, setMailingState] = useState(carrier?.mailing_state || '')
  const [mailingZip, setMailingZip] = useState(carrier?.mailing_zip || '')

  // Insurance
  const [bipdInsurer, setBipdInsurer] = useState(carrier?.bipd_insurer || String(rawIns.bipdInsurer || '') || '')
  const [bipdPolicyNumber, setBipdPolicyNumber] = useState(carrier?.bipd_policy_number || '')
  const [cargoInsurer, setCargoInsurer] = useState(carrier?.cargo_insurer || String(rawIns.cargoInsurer || '') || '')
  const [cargoPolicyNumber, setCargoPolicyNumber] = useState(carrier?.cargo_policy_number || '')

  // Equipment
  const [straightTrucks, setStraightTrucks] = useState(eq.straightTrucks ?? 0)
  const [tractorTrailers, setTractorTrailers] = useState(eq.tractorTrailers ?? 0)
  const [flatbeds, setFlatbeds] = useState(eq.flatbeds ?? 0)
  const [reefers, setReefers] = useState(eq.reefers ?? 0)
  const [tankers, setTankers] = useState(eq.tankers ?? 0)
  const [intermodal, setIntermodal] = useState(eq.intermodal ?? 0)

  // Inspections
  const [vehicleInspTotal, setVehicleInspTotal] = useState(carrier?.vehicle_inspections_total ?? 0)
  const [vehicleInspOos, setVehicleInspOos] = useState(carrier?.vehicle_inspections_oos ?? 0)
  const [driverInspTotal, setDriverInspTotal] = useState(carrier?.driver_inspections_total ?? 0)
  const [driverInspOos, setDriverInspOos] = useState(carrier?.driver_inspections_oos ?? 0)

  // Crashes
  const [crashesFatal, setCrashesFatal] = useState(carrier?.crashes_fatal ?? 0)
  const [crashesInjury, setCrashesInjury] = useState(carrier?.crashes_injury ?? 0)
  const [crashesTowaway, setCrashesTowaway] = useState(carrier?.crashes_towaway ?? 0)

  // Service lanes
  const [serviceLanes, setServiceLanes] = useState<string[]>(
    Array.isArray(carrier?.service_lanes) && carrier.service_lanes.length > 0 ? carrier.service_lanes : []
  )
  const [newLane, setNewLane] = useState('')

  // Custom domain
  const [customDomain, setCustomDomain] = useState(carrier?.custom_domain || '')
  const [domainStatus, setDomainStatus] = useState(carrier?.custom_domain_status || 'none')
  const [savingDomain, setSavingDomain] = useState(false)
  const [domainError, setDomainError] = useState('')
  const [copied, setCopied] = useState(false)
  const { hasFeature } = useSubscription()
  const canUseCustomDomain = hasFeature('customDomain')
  const subdomainUrl = carrier?.website_slug ? `${carrier.website_slug}.loadira.com` : ''

  // Documents from DB
  const [documents, setDocuments] = useState<DocRow[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Fetch documents from DB
  useEffect(() => {
    if (!carrier?.id) { setDocsLoading(false); return }
    supabase
      .from('documents')
      .select('*')
      .eq('carrier_id', carrier.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDocuments(data || [])
        setDocsLoading(false)
      })
  }, [carrier?.id])

  const handleSave = async () => {
    if (!carrier) return
    setIsSaving(true)
    setSaved(false)

    const existing = (carrier.fmcsa_raw || {}) as Record<string, unknown>
    const updatePayload = sanitizeForDb({
      company_description: sanitizeText(heroText, 1000),
      brand_color: sanitizeHexColor(primaryColor),
      email: sanitizeText(email, 200),
      phone: sanitizeText(phone, 30),
      address_street: sanitizeText(addressStreet, 200),
      address_city: sanitizeText(addressCity, 100),
      address_state: sanitizeText(addressState, 50),
      address_zip: sanitizeText(addressZip, 20),
      mailing_street: sanitizeText(mailingStreet, 200),
      mailing_city: sanitizeText(mailingCity, 100),
      mailing_state: sanitizeText(mailingState, 50),
      mailing_zip: sanitizeText(mailingZip, 20),
      bipd_insurer: sanitizeText(bipdInsurer, 200),
      bipd_policy_number: sanitizeText(bipdPolicyNumber, 100),
      cargo_insurer: sanitizeText(cargoInsurer, 200),
      cargo_policy_number: sanitizeText(cargoPolicyNumber, 100),
      vehicle_inspections_total: vehicleInspTotal,
      vehicle_inspections_oos: vehicleInspOos,
      driver_inspections_total: driverInspTotal,
      driver_inspections_oos: driverInspOos,
      crashes_fatal: crashesFatal,
      crashes_injury: crashesInjury,
      crashes_towaway: crashesTowaway,
      equipment: { straightTrucks, tractorTrailers, flatbeds, reefers, tankers, intermodal },
      service_lanes: serviceLanes,
      fmcsa_raw: {
        ...existing,
        brandColor: sanitizeHexColor(primaryColor),
        companyDescription: sanitizeText(heroText, 1000),
      },
    } as Record<string, unknown>)

    await supabase.from('carriers').update(updatePayload).eq('id', carrier.id)
    await refreshCarrier()
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !carrier) return

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Logo must be under 2MB.')
      return
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Logo must be PNG, JPG, or WebP.')
      return
    }

    // Validate file magic bytes
    const magicValid = await validateFileMagic(file, ['png', 'jpg', 'webp'])
    if (!magicValid) {
      setUploadError('File content does not match its type. Please upload a valid image.')
      return
    }

    setUploadingLogo(true)
    setUploadError('')

    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z]/g, '') || 'png'
    const path = `${carrier.user_id}/logo.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('carrier-assets')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      setUploadError('Failed to upload logo. Please try again.')
      setUploadingLogo(false)
      return
    }

    const { data: urlData } = supabase.storage.from('carrier-assets').getPublicUrl(path)
    const publicUrl = urlData.publicUrl + '?t=' + Date.now()

    await supabase.from('carriers').update({ logo_url: publicUrl }).eq('id', carrier.id)
    setLogoUrl(publicUrl)
    await refreshCarrier()
    setUploadingLogo(false)
  }

  // Document upload
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !carrier) return

    // Validate extension
    const docExt = file.name.split('.').pop()?.toLowerCase()
    if (!docExt || !['pdf', 'png', 'jpg', 'jpeg'].includes(docExt)) {
      setUploadError('Document must be PDF, PNG, or JPG.')
      return
    }

    // Validate magic bytes
    const magicTypes = docExt === 'pdf' ? ['pdf'] : docExt === 'png' ? ['png'] : ['jpg']
    const docMagicValid = await validateFileMagic(file, magicTypes)
    if (!docMagicValid) {
      setUploadError('File content does not match its extension. Please upload a valid file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Document must be under 10MB.')
      return
    }

    setUploadingDoc(true)
    setUploadError('')

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${carrier.user_id}/docs/${timestamp}_${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from('carrier-assets')
      .upload(path, file)

    if (uploadErr) {
      setUploadError(uploadErr.message)
      setUploadingDoc(false)
      return
    }

    const { data: urlData } = supabase.storage.from('carrier-assets').getPublicUrl(path)

    const docType = file.name.toLowerCase().includes('w9') || file.name.toLowerCase().includes('w-9')
      ? 'W-9 Form'
      : file.name.toLowerCase().includes('coi') || file.name.toLowerCase().includes('insurance')
        ? 'Certificate of Insurance'
        : file.name.toLowerCase().includes('agreement')
          ? 'Carrier Agreement'
          : 'Document'

    const { data: newDoc } = await supabase.from('documents').insert({
      carrier_id: carrier.id,
      name: file.name,
      type: docType,
      file_url: urlData.publicUrl,
    }).select().single()

    if (newDoc) {
      setDocuments(prev => [newDoc, ...prev])
    }

    setUploadingDoc(false)
    if (docInputRef.current) docInputRef.current.value = ''
  }

  // Document delete
  const removeDocument = async (doc: DocRow) => {
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocuments(prev => prev.filter(d => d.id !== doc.id))
  }

  const addLane = () => {
    if (newLane.trim() && !serviceLanes.includes(newLane.trim())) {
      setServiceLanes([...serviceLanes, newLane.trim()])
      setNewLane('')
    }
  }

  const removeLane = (index: number) => {
    setServiceLanes(serviceLanes.filter((_, i) => i !== index))
  }

  const copySubdomain = () => {
    navigator.clipboard.writeText(`https://${subdomainUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveDomain = async () => {
    if (!carrier || !canUseCustomDomain) return
    setDomainError('')

    const clean = customDomain.toLowerCase().replace(/[^a-z0-9.-]/g, '').replace(/^(https?:\/\/)?(www\.)?/, '')
    if (!clean) {
      // Remove custom domain
      setSavingDomain(true)
      await supabase.from('carriers').update({ custom_domain: null, custom_domain_status: 'none' }).eq('id', carrier.id)
      setDomainStatus('none')
      setCustomDomain('')
      await refreshCarrier()
      setSavingDomain(false)
      return
    }

    if (!clean.includes('.') || clean.length > 253) {
      setDomainError('Please enter a valid domain (e.g., mycarrier.com)')
      return
    }
    if (clean.endsWith('.loadira.com') || clean === 'loadira.com') {
      setDomainError('Cannot use loadira.com as a custom domain. Your subdomain is already active.')
      return
    }

    setSavingDomain(true)

    // Save to DB
    const { error: dbErr } = await supabase.from('carriers').update({
      custom_domain: clean,
      custom_domain_status: 'pending',
    }).eq('id', carrier.id)

    if (dbErr) {
      setDomainError('Failed to save domain. It may already be in use.')
      setSavingDomain(false)
      return
    }

    // Provision on Netlify
    try {
      const res = await fetch('/.netlify/functions/provision-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: clean }),
      })
      const data = await res.json()
      if (res.ok) {
        setDomainStatus('pending')
        setCustomDomain(clean)
      } else {
        setDomainError(data.error || 'Failed to provision domain')
      }
    } catch {
      setDomainError('Failed to connect to provisioning service')
    }

    await refreshCarrier()
    setSavingDomain(false)
  }

  const removeDomain = async () => {
    if (!carrier || !customDomain) return
    setSavingDomain(true)

    try {
      await fetch('/.netlify/functions/provision-domain', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      })
    } catch { /* ignore */ }

    await supabase.from('carriers').update({ custom_domain: null, custom_domain_status: 'none' }).eq('id', carrier.id)
    setCustomDomain('')
    setDomainStatus('none')
    await refreshCarrier()
    setSavingDomain(false)
  }

  const numInput = (value: number, setter: (v: number) => void) => (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setter(Math.max(0, parseInt(e.target.value) || 0))}
      className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-gray-400 mt-1">Customize your carrier website and profile.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>

        {uploadError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
            {uploadError}
            <button onClick={() => setUploadError('')} className="ml-2 text-red-300 hover:text-white cursor-pointer">&times;</button>
          </div>
        )}

        <div className="space-y-8">
          {/* Domain Management */}
          <SettingsSection icon={<Globe className="w-5 h-5" />} title="Domain & URL" description="Your carrier website address. Share with brokers and shippers.">
            {/* Subdomain (always available) */}
            <div className="mb-5">
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Your Loadira Subdomain</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm">
                  <LinkIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  <span className="text-amber-400 font-medium truncate">{subdomainUrl || 'your-carrier.loadira.com'}</span>
                </div>
                <button onClick={copySubdomain} disabled={!subdomainUrl} className="flex items-center gap-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-3 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50" aria-label="Copy subdomain URL">
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                {subdomainUrl && (
                  <a href={`https://${subdomainUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-3 py-2.5 rounded-xl transition-colors" aria-label="Open subdomain">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">This is always active. Anyone can view your carrier profile at this address.</p>
            </div>

            {/* Custom Domain (paid plans) */}
            <div className="pt-5 border-t border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs text-gray-400 font-medium">Custom Domain</label>
                {!canUseCustomDomain && (
                  <a href="/pricing" className="text-xs text-amber-400 hover:text-amber-300">Upgrade to Professional</a>
                )}
              </div>

              {canUseCustomDomain ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                      placeholder="www.mycarrier.com"
                      className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button onClick={handleSaveDomain} disabled={savingDomain} className="flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                      {savingDomain ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                    </button>
                  </div>

                  {domainError && <p className="text-red-400 text-xs">{domainError}</p>}

                  {/* Domain status */}
                  {domainStatus === 'pending' && customDomain && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm font-medium text-amber-300">DNS Pending</span>
                      </div>
                      <p className="text-xs text-amber-300/70">Add this DNS record at your domain registrar:</p>
                      <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type</span>
                          <span className="text-white">CNAME</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name</span>
                          <span className="text-white">{customDomain.startsWith('www.') ? 'www' : '@'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Value</span>
                          <span className="text-amber-400">loadira.com</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">DNS changes can take up to 48 hours to propagate. SSL is auto-provisioned by Netlify after DNS is verified.</p>
                    </div>
                  )}

                  {domainStatus === 'verified' && customDomain && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-300 font-medium">{customDomain} is active</span>
                      </div>
                      <button onClick={removeDomain} disabled={savingDomain} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">Remove</button>
                    </div>
                  )}

                  {domainStatus === 'error' && customDomain && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-300">DNS verification failed — check your records</span>
                      </div>
                      <button onClick={removeDomain} disabled={savingDomain} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">Remove</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <Globe className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 mb-1">Use your own domain</p>
                  <p className="text-xs text-gray-500">Available on Professional and Fleet plans</p>
                </div>
              )}
            </div>
          </SettingsSection>

          {/* Logo Upload */}
          <SettingsSection icon={<Image className="w-5 h-5" />} title="Company Logo" description="Upload your company logo. Displayed on your website and broker packet.">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <Image className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </button>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG, or WebP. Max 2MB.</p>
              </div>
            </div>
          </SettingsSection>

          {/* Brand Color */}
          <SettingsSection icon={<Palette className="w-5 h-5" />} title="Brand Color" description="Choose your primary accent color for your website.">
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                {['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'].map((color) => (
                  <button key={color} onClick={() => setPrimaryColor(color)} className={`w-10 h-10 rounded-xl transition-all cursor-pointer ${primaryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color }} />
                ))}
              </div>
              <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(sanitizeHexColor(e.target.value))} className="w-28 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ml-4" />
            </div>
          </SettingsSection>

          {/* Company Description */}
          <SettingsSection icon={<FileText className="w-5 h-5" />} title="Company Description" description="Describe your company, services, and what sets you apart.">
            <textarea value={heroText} onChange={(e) => setHeroText(sanitizeText(e.target.value, 1000))} rows={5} className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none" />
            <p className="text-xs text-gray-500 mt-2">{heroText.length} / 1000 characters</p>
          </SettingsSection>

          {/* Contact Info */}
          <SettingsSection icon={<Phone className="w-5 h-5" />} title="Contact Information" description="Phone and email displayed on your website.">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={phone} onChange={(e) => setPhone(sanitizeText(e.target.value, 30))} placeholder="(555) 123-4567" className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dispatch@company.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Physical Address */}
          <SettingsSection icon={<Home className="w-5 h-5" />} title="Physical Address" description="Your company's physical location.">
            <div className="space-y-3">
              <input type="text" value={addressStreet} onChange={(e) => setAddressStreet(sanitizeText(e.target.value, 200))} placeholder="Street address" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={addressCity} onChange={(e) => setAddressCity(sanitizeText(e.target.value, 100))} placeholder="City" className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <input type="text" value={addressState} onChange={(e) => setAddressState(sanitizeText(e.target.value, 50))} placeholder="State" className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <input type="text" value={addressZip} onChange={(e) => setAddressZip(sanitizeText(e.target.value, 20))} placeholder="ZIP" className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs text-gray-400 mb-2 font-medium">Mailing Address (if different)</p>
              <div className="space-y-3">
                <input type="text" value={mailingStreet} onChange={(e) => setMailingStreet(sanitizeText(e.target.value, 200))} placeholder="Mailing street address" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" value={mailingCity} onChange={(e) => setMailingCity(sanitizeText(e.target.value, 100))} placeholder="City" className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  <input type="text" value={mailingState} onChange={(e) => setMailingState(sanitizeText(e.target.value, 50))} placeholder="State" className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  <input type="text" value={mailingZip} onChange={(e) => setMailingZip(sanitizeText(e.target.value, 20))} placeholder="ZIP" className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Insurance */}
          <SettingsSection icon={<ShieldCheck className="w-5 h-5" />} title="Insurance Details" description="Policy numbers and insurer names displayed on your profile and broker packet.">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">BIPD (Liability)</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Insurer</label>
                  <input type="text" value={bipdInsurer} onChange={(e) => setBipdInsurer(sanitizeText(e.target.value, 200))} placeholder="e.g. National Interstate Insurance Co." className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Policy Number</label>
                  <input type="text" value={bipdPolicyNumber} onChange={(e) => setBipdPolicyNumber(sanitizeText(e.target.value, 100))} placeholder="e.g. BPD-2024-881742" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">Cargo</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Insurer</label>
                  <input type="text" value={cargoInsurer} onChange={(e) => setCargoInsurer(sanitizeText(e.target.value, 200))} placeholder="e.g. Great West Casualty Company" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Policy Number</label>
                  <input type="text" value={cargoPolicyNumber} onChange={(e) => setCargoPolicyNumber(sanitizeText(e.target.value, 100))} placeholder="e.g. CRG-2024-553291" className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Equipment */}
          <SettingsSection icon={<Truck className="w-5 h-5" />} title="Fleet Equipment" description="Your equipment breakdown displayed on your profile.">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Straight Trucks', value: straightTrucks, setter: setStraightTrucks },
                { label: 'Tractor Trailers', value: tractorTrailers, setter: setTractorTrailers },
                { label: 'Flatbeds', value: flatbeds, setter: setFlatbeds },
                { label: 'Reefers', value: reefers, setter: setReefers },
                { label: 'Tankers', value: tankers, setter: setTankers },
                { label: 'Intermodal', value: intermodal, setter: setIntermodal },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  {numInput(item.value, item.setter)}
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Inspections & Crashes */}
          <SettingsSection icon={<AlertTriangle className="w-5 h-5" />} title="Inspections & Crash History" description="Safety record data for your profile and broker packet.">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">Vehicle Inspections</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    {numInput(vehicleInspTotal, setVehicleInspTotal)}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Out of Service</label>
                    {numInput(vehicleInspOos, setVehicleInspOos)}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">Driver Inspections</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Total</label>
                    {numInput(driverInspTotal, setDriverInspTotal)}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Out of Service</label>
                    {numInput(driverInspOos, setDriverInspOos)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-800">
              <p className="text-sm font-medium text-gray-300 mb-3">Crash History</p>
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fatal</label>
                  {numInput(crashesFatal, setCrashesFatal)}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Injury</label>
                  {numInput(crashesInjury, setCrashesInjury)}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Towaway</label>
                  {numInput(crashesTowaway, setCrashesTowaway)}
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Service Lanes */}
          <SettingsSection icon={<MapPin className="w-5 h-5" />} title="Service Lanes" description="Define the routes and regions you service.">
            <div className="space-y-3">
              {serviceLanes.map((lane, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300">{lane}</div>
                  <button onClick={() => removeLane(i)} className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-2"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <input type="text" value={newLane} onChange={(e) => setNewLane(sanitizeText(e.target.value, 100))} onKeyDown={(e) => e.key === 'Enter' && addLane()} placeholder="e.g. Texas to California" className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                <button onClick={addLane} disabled={!newLane.trim()} className="flex items-center gap-1.5 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white px-4 py-3 rounded-xl transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Add</button>
              </div>
            </div>
          </SettingsSection>

          {/* Documents */}
          <SettingsSection icon={<FileText className="w-5 h-5" />} title="Documents" description="Upload W-9, insurance certificates, carrier agreements, and other documents.">
            <div className="space-y-3">
              {docsLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading documents...
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">No documents uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3">
                    <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate block hover:text-orange-400 transition-colors">{doc.name}</a>
                      <p className="text-xs text-gray-500">{doc.type} &middot; {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => removeDocument(doc)} className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
              <input ref={docInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleDocUpload} className="hidden" />
              <button
                onClick={() => docInputRef.current?.click()}
                disabled={uploadingDoc}
                className="w-full flex items-center justify-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 text-gray-400 hover:text-white px-4 py-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingDoc ? 'Uploading...' : 'Upload Document'}
              </button>
              <p className="text-xs text-gray-500">PDF, PNG, or JPG. Max 10MB per file.</p>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">Permanently delete your carrier website and all associated data. This action cannot be undone.</p>
            <button className="flex items-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /> Delete My Site</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SettingsSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default Settings
