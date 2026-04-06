import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './components/LoginPage'
import { Layout, NavButton } from './components/Layout'
import { EquipmentList } from './components/EquipmentList'
import { CategoryManager } from './components/CategoryManager'
import { RefuelingHistory } from './components/RefuelingHistory'

function TabBar({ activeTab, onChange }) {
  const tabs = [
    {
      id: 'maintenance',
      label: 'Wartung',
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
    },
    {
      id: 'refueling',
      label: 'Tanken',
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 22V8a2 2 0 012-2h6a2 2 0 012 2v14"/>
          <path d="M3 22h10M13 8h1a2 2 0 012 2v2.5a1.5 1.5 0 003 0V9l-3-3"/>
          <path d="M3 12h10"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-xl border-t border-black/[0.08]">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 pb-safe active:opacity-60 transition-opacity"
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-medium ${active ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
      {/* Safe area spacer for iPhone home indicator */}
      <div className="h-5" />
    </div>
  )
}

export default function App() {
  const { session, signOut, loading } = useAuth()
  const [tab, setTab] = useState('maintenance')
  const [showCategories, setShowCategories] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editMode, setEditMode] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <p className="text-[#8E8E93] text-[17px]">Loading…</p>
      </div>
    )
  }

  if (!session) return <LoginPage />

  const navRight = tab === 'maintenance'
    ? editMode
      ? <NavButton onClick={() => setEditMode(false)}>Done</NavButton>
      : (
        <div className="flex items-center gap-4">
          <NavButton onClick={() => setShowCategories(true)}>
            <span className="text-[15px]">Categories</span>
          </NavButton>
          <NavButton onClick={() => setEditMode(true)}>
            <span className="text-[15px]">Edit</span>
          </NavButton>
          <NavButton onClick={() => setShowAdd(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z"/>
            </svg>
          </NavButton>
          <NavButton onClick={signOut}>
            <span className="text-[15px]">Sign out</span>
          </NavButton>
        </div>
      )
    : (
      <div className="flex items-center gap-4">
        <NavButton onClick={() => setShowAdd(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z"/>
          </svg>
        </NavButton>
        <NavButton onClick={signOut}>
          <span className="text-[15px]">Sign out</span>
        </NavButton>
      </div>
    )

  return (
    <>
      <Layout title="Yacht Maintenance" right={navRight}>
        {/* Extra bottom padding so tab bar doesn't cover content */}
        <div className="pb-28">
          {tab === 'maintenance' && (
            <EquipmentList
              showAdd={showAdd}
              onAddClose={() => setShowAdd(false)}
              editMode={editMode}
              onEditDone={() => setEditMode(false)}
            />
          )}
          {tab === 'refueling' && (
            <RefuelingHistory
              showAdd={showAdd}
              onAddClose={() => setShowAdd(false)}
            />
          )}
        </div>
      </Layout>

      <TabBar
        activeTab={tab}
        onChange={(t) => { setTab(t); setShowAdd(false); setEditMode(false) }}
      />

      {showCategories && tab === 'maintenance' && !editMode && (
        <CategoryManager onClose={() => setShowCategories(false)} />
      )}
    </>
  )
}
