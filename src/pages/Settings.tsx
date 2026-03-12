import { useState } from 'react'
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
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { mockCarrier } from '../lib/mockFmcsa'

function Settings() {
  const carrier = mockCarrier

  const [companyDescription, setCompanyDescription] = useState(carrier.companyDescription)
  const [brandColor, setBrandColor] = useState(carrier.brandColor)
  const [serviceLanes, setServiceLanes] = useState(carrier.serviceLanes)
  const [newLane, setNewLane] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [documents, setDocuments] = useState<{ name: string; type: string; date: string }[]>([
    { name: 'W9-LoneStarExpress.pdf', type: 'W-9 Form', date: '2024-12-01' },
    { name: 'COI-2025.pdf', type: 'Certificate of Insurance', date: '2025-01-15' },
    { name: 'CarrierAgreement.pdf', type: 'Carrier Agreement', date: '2025-02-10' },
  ])

  const handleSave = async () => {
    setIsSaving(true)
    setSaved(false)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar authenticated />

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
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="space-y-8">
          {/* Logo Upload */}
          <SettingsSection
            icon={<Image className="w-5 h-5" />}
            title="Company Logo"
            description="Upload your company logo. Displayed on your website and broker packet."
          >
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-800 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center">
                {carrier.logoUrl ? (
                  <img src={carrier.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <Image className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div>
                <button className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, or SVG. Max 2MB. Recommended 512x512px.</p>
              </div>
            </div>
          </SettingsSection>

          {/* Brand Color */}
          <SettingsSection
            icon={<Palette className="w-5 h-5" />}
            title="Brand Color"
            description="Choose your primary accent color for your website."
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                {['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => setBrandColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all cursor-pointer ${
                        brandColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-28 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </SettingsSection>

          {/* Company Description */}
          <SettingsSection
            icon={<FileText className="w-5 h-5" />}
            title="Company Description"
            description="Describe your company, services, and what sets you apart."
          >
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">{companyDescription.length} / 1000 characters</p>
          </SettingsSection>

          {/* Service Lanes */}
          <SettingsSection
            icon={<MapPin className="w-5 h-5" />}
            title="Service Lanes"
            description="Define the routes and regions you service."
          >
            <div className="space-y-3">
              {serviceLanes.map((lane, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300">
                    {lane}
                  </div>
                  <button
                    onClick={() => removeLane(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newLane}
                  onChange={(e) => setNewLane(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLane()}
                  placeholder="e.g. Texas to California"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={addLane}
                  disabled={!newLane.trim()}
                  className="flex items-center gap-1.5 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white px-4 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Documents */}
          <SettingsSection
            icon={<FileText className="w-5 h-5" />}
            title="Documents"
            description="Upload W-9, insurance certificates, carrier agreements, and other documents."
          >
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3">
                  <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.type} &middot; Uploaded {doc.date}</p>
                  </div>
                  <button
                    onClick={() => removeDocument(i)}
                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 text-gray-400 hover:text-white px-4 py-4 rounded-xl transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
              <p className="text-xs text-gray-500">PDF, PNG, or JPG. Max 10MB per file.</p>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-400 mb-4">
              Permanently delete your carrier website and all associated data. This action cannot be undone.
            </p>
            <button className="flex items-center gap-2 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg transition-colors cursor-pointer">
              <Trash2 className="w-4 h-4" />
              Delete My Site
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0">
          {icon}
        </div>
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
