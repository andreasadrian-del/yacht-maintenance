export function Layout({ title, right, children }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Nav bar */}
      <header className="bg-[#F2F2F7]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-black/[0.08]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚓</span>
            <span className="font-semibold text-[17px] text-black">{title}</span>
          </div>
          {right}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-10">
        {children}
      </main>
    </div>
  )
}

export function Sheet({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#F2F2F7] rounded-t-[20px] w-full max-w-2xl max-h-[92svh] flex flex-col shadow-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-black/20" />
        </div>
        {children}
      </div>
    </div>
  )
}

export function InsetGroup({ label, children, footer }) {
  return (
    <div className="mb-6">
      {label && (
        <p className="text-[13px] font-medium text-[#6C6C70] uppercase tracking-wide px-4 mb-2">{label}</p>
      )}
      <div className="bg-white rounded-[12px] overflow-hidden divide-y divide-black/[0.08]">
        {children}
      </div>
      {footer && (
        <p className="text-[13px] text-[#6C6C70] px-4 mt-2">{footer}</p>
      )}
    </div>
  )
}

export function NavButton({ onClick, children, destructive }) {
  return (
    <button
      onClick={onClick}
      className={`text-[17px] font-normal ${destructive ? 'text-[#FF3B30]' : 'text-[#007AFF]'} active:opacity-50 transition-opacity`}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({ onClick, type = 'button', disabled, children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[#007AFF] text-white rounded-[12px] py-[14px] text-[17px] font-semibold disabled:opacity-40 active:opacity-80 transition-opacity"
    >
      {children}
    </button>
  )
}

export function TextInput({ label, ...props }) {
  return (
    <div className="px-4 py-3">
      {label && <p className="text-[13px] text-[#6C6C70] mb-1">{label}</p>}
      <input
        {...props}
        className="w-full text-[17px] text-black placeholder-[#C7C7CC] focus:outline-none bg-transparent"
      />
    </div>
  )
}
