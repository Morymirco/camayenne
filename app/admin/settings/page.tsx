'use client'

import { useState } from 'react'
import { FiMoon, FiSun, FiGlobe, FiBell, FiLock, FiUser, FiSave } from 'react-icons/fi'

type Settings = {
  theme: 'light' | 'dark' | 'system'
  language: 'fr' | 'en'
  notifications: boolean
  autoZoom: boolean
  defaultLocation: [number, number]
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'fr',
    notifications: true,
    autoZoom: true,
    defaultLocation: [9.5370, -13.6785]
  })

  const [isSuccess, setIsSuccess] = useState(false)

  const handleSave = async () => {
    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gérez les paramètres de votre application
        </p>
      </div>

      <div className="space-y-6">
        {/* Apparence */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiUser className="mr-2" />
            Apparence
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thème
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSettings({ ...settings, theme: theme as 'light' | 'dark' | 'system' })}
                    className={`flex items-center justify-center px-4 py-2 border rounded-lg ${
                      settings.theme === theme
                        ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiGlobe className="inline mr-2" />
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value as 'fr' | 'en' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiBell className="mr-2" />
            Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Activer les notifications
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoZoom}
                onChange={(e) => setSettings({ ...settings, autoZoom: e.target.checked })}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Zoom automatique sur les lieux
              </span>
            </label>
          </div>
        </div>

        {/* Position par défaut */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FiGlobe className="mr-2" />
            Position par défaut
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude
              </label>
              <input
                type="number"
                value={settings.defaultLocation[0]}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultLocation: [parseFloat(e.target.value), settings.defaultLocation[1]]
                })}
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude
              </label>
              <input
                type="number"
                value={settings.defaultLocation[1]}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultLocation: [settings.defaultLocation[0], parseFloat(e.target.value)]
                })}
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiSave className="mr-2" />
            Enregistrer les modifications
          </button>
        </div>

        {/* Message de succès */}
        {isSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Paramètres enregistrés avec succès !
          </div>
        )}
      </div>
    </div>
  )
} 