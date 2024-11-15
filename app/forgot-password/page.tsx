'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiMail, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500))
      setStatus('success')
      setMessage('Un email de réinitialisation a été envoyé à votre adresse.')
    } catch (error) {
      setStatus('error')
      setMessage('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mot de passe oublié
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>{message}</p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <FiArrowLeft className="mr-2" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            {status === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                <FiAlertCircle className="mr-2" />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors ${
                  status === 'loading'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-600'
                }`}
              >
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 