import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import CustomerForm from './components/CustomerForm'
import Dashboard    from './components/Dashboard'

export default function App() {
  const [page, setPage] = useState('form') // 'form' | 'dashboard'
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // ── Online / offline detection ─────────────────────────────────────
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // ── Convex ─────────────────────────────────────────────────────────
  const customers     = useQuery(api.customers.list)   ?? []
  const addCustomer   = useMutation(api.customers.add)
  const deleteCustomer = useMutation(api.customers.remove)

  const handleSubmit = async (data) => {
    await addCustomer(data)
  }

  const handleDelete = async (id) => {
    await deleteCustomer({ id })
  }

  return (
    <>
      {page === 'form' ? (
        <CustomerForm
          onSubmit={handleSubmit}
          onDashboard={() => setPage('dashboard')}
        />
      ) : (
        <Dashboard
          customers={customers}
          onBack={() => setPage('form')}
          onDelete={handleDelete}
        />
      )}

      {!isOnline && (
        <div className="offline-banner">
          ⚠️ Fără conexiune la internet — datele vor fi salvate când revine conexiunea
        </div>
      )}
    </>
  )
}
