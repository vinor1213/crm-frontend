'use client'

import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Select from 'react-select'
import { getActiveInstitutions } from '@/app/lib/request/institutionRequest'
import { saveSettings, Settings as SettingsType, getSettingsByInstitute } from '@/app/lib/request/settingRequest'

interface OptionType {
  value: string
  label: string
}

interface PaymentData {
  authToken: string
  apiKey: string
  merchantId: string
}

export default function SettingsPage() {
  const [institutions, setInstitutions] = useState<OptionType[]>([])
  const [selectedInstitute, setSelectedInstitute] = useState<OptionType | null>(null)

  const [formData, setFormData] = useState({
    image: '',
    selectedCourse: ''
  })
  const [courseInput, setCourseInput] = useState('')
  const [customCourses, setCustomCourses] = useState<string[]>([])

  const [paymentData, setPaymentData] = useState<PaymentData>({
    authToken: '',
    apiKey: '',
    merchantId: ''
  })

  const inputClass =
    'border rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none'

  // ------------------- Fetch institutions -------------------
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await getActiveInstitutions()
        const opts = res.map((inst: any) => ({
          value: inst.instituteId,
          label: inst.name
        }))
        setInstitutions(opts)
      } catch {
        toast.error('Failed to load institutions')
      }
    }
    fetchInstitutions()
  }, [])

  // ------------------- Fetch settings on institute select -------------------
  useEffect(() => {
    if (!selectedInstitute) return

    const fetchSettings = async () => {
      try {
        const data = await getSettingsByInstitute(selectedInstitute.value)
        console.log(data, "data")

        // Settings exist → prefill for update
        setFormData({

          image: data.logo || '',
          selectedCourse: data.courses?.[0] || ''
        })
        setCustomCourses(data.courses ? data.courses.slice(1) : [])
        setPaymentData({
          authToken: data.authToken || '',
          apiKey: data.apiKey || '',
          merchantId: data.merchantId || ''
        })
      } catch (error: any) {
        if (error.message.includes('Settings not found')) {
          // Settings not found → new creation
          setFormData({ image: '', selectedCourse: '' })
          setCustomCourses([])
          setPaymentData({ authToken: '', apiKey: '', merchantId: '' })
          toast.error('No settings found. You can create new settings.')
        } else {
          toast.error(error.message)
        }
      }
    }

    fetchSettings()
  }, [selectedInstitute])

  // ------------------- Handlers -------------------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleAddCourse = () => {
    if (!courseInput.trim()) {
      toast.error('Please enter a course name')
      return
    }
    setCustomCourses((prev) => [...prev, courseInput.trim()])
    setCourseInput('')
    toast.success('Course added')
  }

  // ------------------- Save All Settings -------------------
  const handleSaveAll = async () => {
    if (!selectedInstitute) return toast.error('Please select an institute')
    if (!formData.image) return toast.error('Please upload an institute logo')
    if (!formData.selectedCourse && customCourses.length === 0)
      return toast.error('Please add/select at least one course')
    if (!paymentData.authToken || !paymentData.apiKey || !paymentData.merchantId)
      return toast.error('Please fill all payment details')

    const allCourses = [
      ...(formData.selectedCourse ? [formData.selectedCourse] : []),
      ...customCourses
    ]

    const payload: SettingsType = {
      instituteId: selectedInstitute.value,
      logo: formData.image,
      courses: allCourses,
      authToken: paymentData.authToken,
      apiKey: paymentData.apiKey,
      merchantId: paymentData.merchantId
    }

    try {
      const data = await saveSettings(payload)
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <Toaster position="top-right" />

      {/* ---------------- General Settings ---------------- */}
      <div className="border rounded">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold rounded-t">
          General Settings
        </div>
        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Institute <span className="text-red-500">*</span>
            </label>
            <Select
              options={institutions}
              value={selectedInstitute}
              onChange={(selected) => setSelectedInstitute(selected)}
              placeholder="Select Institute"
              isClearable
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Logo <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              {formData.image && (
                <img src={formData.image} alt="Logo" className="w-20 h-20 rounded border" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border w-full"
              />
            </div>
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Courses <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Enter course name"
                className={inputClass}
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900"
                onClick={handleAddCourse}
              >
                + Add
              </button>
            </div>
            <Select
              options={customCourses.map((c) => ({ value: c, label: c }))}
              value={
                formData.selectedCourse
                  ? { value: formData.selectedCourse, label: formData.selectedCourse }
                  : null
              }
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, selectedCourse: selected?.value || '' }))
              }
              placeholder="Select course"
              isSearchable
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* ---------------- Payment Settings ---------------- */}
      <div className="border rounded">
        <div className="bg-green-600 text-white px-4 py-2 font-semibold rounded-t">
          Payment Settings
        </div>
        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Auth Token <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={paymentData.authToken}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, authToken: e.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={paymentData.apiKey}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-1">
              Merchant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={paymentData.merchantId}
              onChange={(e) => setPaymentData((prev) => ({ ...prev, merchantId: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* ---------------- Save Button ---------------- */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
