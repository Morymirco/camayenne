'use client'

import { useState } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAlert } from '@/app/contexts/AlertContext'
import { FiMoon, FiSun, FiGlobe, FiBell, FiLock } from 'react-icons/fi'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/services/firebase/config'

type Settings = {
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'en'
  notifications: boolean
  emailNotifications: boolean
  autoZoom: boolean
}

const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string }) => (
  <label className="flex items-center space-x-3 cursor-pointer group">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-6 h-6 border-2 rounded-lg border-gray-300 dark:border-gray-600 
        peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all
        group-hover:border-blue-400 dark:group-hover:border-blue-400">
        <svg
          className={`w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${checked ? 'text-white scale-100' : 'scale-0'}
            transition-transform duration-200 ease-out`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span className="text-gray-700 dark:text-gray-300">{label}</span>
  </label>
)

export default function SettingsPage() {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'fr',
    notifications: true,
    emailNotifications: true,
    autoZoom: true
  })

  const handleSave = async () => {
    try {
      // Sauvegarder les paramètres dans Firestore
      await updateDoc(doc(db, 'users', user!.uid), {
        settings: settings,
        updatedAt: new Date().toISOString()
      })
      showAlert('Paramètres enregistrés avec succès', 'success')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error)
      showAlert('Erreur lors de la sauvegarde des paramètres', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
            <p className="text-gray-500 dark:text-gray-400">Personnalisez votre expérience</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Apparence */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiSun className="mr-2" />
                Apparence
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thème
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSettings({ ...settings, theme: theme as 'light' | 'dark' | 'system' })}
                        className={`flex items-center justify-center px-4 py-2 border rounded-lg ${
                          settings.theme === theme
                            ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {theme === 'light' && <FiSun className="mr-2" />}
                        {theme === 'dark' && <FiMoon className="mr-2" />}
                        {theme === 'system' && <FiLock className="mr-2" />}
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Langue
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value as 'fr' | 'en' })}
                    className="mt-2 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiBell className="mr-2" />
                Notifications
              </h2>
              <div className="space-y-4">
                <CustomCheckbox
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  label="Notifications push"
                />

                <CustomCheckbox
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  label="Notifications par email"
                />
              </div>
            </div>

            {/* Carte */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiGlobe className="mr-2" />
                Carte
              </h2>
              <div className="space-y-4">
                <CustomCheckbox
                  checked={settings.autoZoom}
                  onChange={(e) => setSettings({ ...settings, autoZoom: e.target.checked })}
                  label="Zoom automatique sur les lieux"
                />
              </div>
            </div>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 