import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'

export interface Phrase {
  id: string
  text: string
  shortcut?: string
  category?: string
  createdAt: number
  updatedAt: number
}

export interface QuickPhrasePanelProps {
  /** Pre-loaded phrases */
  phrases?: Phrase[]
  /** Callback when a phrase is selected/inserted */
  onInsert?: (text: string) => void
  /** Callback when phrases change (for persistence) */
  onChange?: (phrases: Phrase[]) => void
  /** Whether the panel is visible */
  visible?: boolean
  /** Close handler */
  onClose?: () => void
  /** Storage key for localStorage persistence (default: 'quick-phrases') */
  storageKey?: string
  /** Z-index (default: 10000) */
  zIndex?: number
}

const STORAGE_KEY_DEFAULT = 'quick-phrases'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadPhrases(key: string): Phrase[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function savePhrases(key: string, phrases: Phrase[]) {
  try {
    localStorage.setItem(key, JSON.stringify(phrases))
  } catch {
    console.warn('[QuickPhrasePanel] Failed to save to localStorage')
  }
}

export const QuickPhrasePanel: React.FC<QuickPhrasePanelProps> = ({
  phrases: externalPhrases,
  onInsert,
  onChange,
  visible = true,
  onClose,
  storageKey = STORAGE_KEY_DEFAULT,
  zIndex = 10000,
}) => {
  const [internalPhrases, setInternalPhrases] = useState<Phrase[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPhraseText, setNewPhraseText] = useState('')
  const [newPhraseShortcut, setNewPhraseShortcut] = useState('')
  const [newPhraseCategory, setNewPhraseCategory] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine phrase source
  const isControlled = externalPhrases !== undefined
  const phrases = isControlled ? externalPhrases : internalPhrases

  const setPhrases = useCallback(
    (next: Phrase[]) => {
      if (!isControlled) {
        setInternalPhrases(next)
        savePhrases(storageKey, next)
      }
      onChange?.(next)
    },
    [isControlled, onChange, storageKey]
  )

  // Load from localStorage on mount
  useEffect(() => {
    if (!isControlled) {
      setInternalPhrases(loadPhrases(storageKey))
    }
  }, [storageKey, isControlled])

  // Auto-focus search input
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [visible])

  // Close on Escape
  useEffect(() => {
    if (!visible) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [visible, onClose])

  // ─── CRUD ───

  const addPhrase = useCallback(() => {
    if (!newPhraseText.trim()) return
    const phrase: Phrase = {
      id: generateId(),
      text: newPhraseText.trim(),
      shortcut: newPhraseShortcut.trim() || undefined,
      category: newPhraseCategory.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const next = [...phrases, phrase]
    setPhrases(next)
    setNewPhraseText('')
    setNewPhraseShortcut('')
    setNewPhraseCategory('')
  }, [newPhraseText, newPhraseShortcut, newPhraseCategory, phrases, setPhrases])

  const deletePhrase = useCallback(
    (id: string) => {
      setPhrases(phrases.filter((p) => p.id !== id))
    },
    [phrases, setPhrases]
  )

  const updatePhrase = useCallback(
    (id: string, updates: Partial<Pick<Phrase, 'text' | 'shortcut' | 'category'>>) => {
      setPhrases(
        phrases.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        )
      )
      setEditingId(null)
    },
    [phrases, setPhrases]
  )

  const handleInsert = useCallback(
    (phrase: Phrase) => {
      onInsert?.(phrase.text)
    },
    [onInsert]
  )

  // ─── Filtering ───

  const filteredPhrases = useMemo(() => {
    if (!searchQuery.trim()) return phrases
    const q = searchQuery.toLowerCase()
    return phrases.filter(
      (p) =>
        p.text.toLowerCase().includes(q) ||
        (p.shortcut?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false)
    )
  }, [phrases, searchQuery])

  // Group by category
  const grouped = useMemo(() => {
    const groups = new Map<string, Phrase[]>()
    for (const phrase of filteredPhrases) {
      const cat = phrase.category || '未分类'
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat)!.push(phrase)
    }
    return groups
  }, [filteredPhrases])

  if (!visible) return null

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="快捷短语面板"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex,
        width: '520px',
        maxHeight: '70vh',
        background: 'rgba(24, 24, 27, 0.98)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#e4e4e7',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          ⚡ 快捷短语
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
          }}
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 20px 8px' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索短语..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#e4e4e7',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Phrase List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 20px',
        }}
      >
        {grouped.size === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              color: '#71717a',
              fontSize: '14px',
            }}
          >
            {searchQuery ? '没有匹配的短语' : '还没有快捷短语，在下方添加一个吧'}
          </div>
        )}

        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              {category}
            </div>
            {items.map((phrase) =>
              editingId === phrase.id ? (
                <EditPhraseRow
                  key={phrase.id}
                  phrase={phrase}
                  onSave={updatePhrase}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  key={phrase.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    marginBottom: '2px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => handleInsert(phrase)}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background =
                      'rgba(255,255,255,0.06)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {phrase.text}
                    </div>
                    {phrase.shortcut && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#71717a',
                          marginTop: '2px',
                        }}
                      >
                        {phrase.shortcut}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingId(phrase.id)
                      }}
                      style={actionBtnStyle}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePhrase(phrase.id)
                      }}
                      style={actionBtnStyle}
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Add new phrase */}
      <div
        style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder="短语内容"
            value={newPhraseText}
            onChange={(e) => setNewPhraseText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addPhrase()
            }}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="快捷键 (可选)"
            value={newPhraseShortcut}
            onChange={(e) => setNewPhraseShortcut(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addPhrase()
            }}
            style={{ ...inputStyle, width: '120px', flexShrink: 0 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="分类 (可选)"
            value={newPhraseCategory}
            onChange={(e) => setNewPhraseCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addPhrase()
            }}
            style={{ ...inputStyle, width: '160px', flexShrink: 0 }}
          />
          <button
            onClick={addPhrase}
            disabled={!newPhraseText.trim()}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: newPhraseText.trim()
                ? 'rgba(99, 102, 241, 0.8)'
                : 'rgba(99, 102, 241, 0.3)',
              color: '#fff',
              fontSize: '14px',
              cursor: newPhraseText.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─── */

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#e4e4e7',
  fontSize: '13px',
  outline: 'none',
  minWidth: 0,
  boxSizing: 'border-box',
}

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '2px 4px',
  borderRadius: '4px',
  opacity: 0.6,
  transition: 'opacity 0.15s',
}

interface EditPhraseRowProps {
  phrase: Phrase
  onSave: (id: string, updates: Partial<Pick<Phrase, 'text' | 'shortcut' | 'category'>>) => void
  onCancel: () => void
}

function EditPhraseRow({ phrase, onSave, onCancel }: EditPhraseRowProps) {
  const [text, setText] = useState(phrase.text)
  const [shortcut, setShortcut] = useState(phrase.shortcut ?? '')
  const [category, setCategory] = useState(phrase.category ?? '')

  const handleSave = () => {
    if (!text.trim()) return
    onSave(phrase.id, {
      text: text.trim(),
      shortcut: shortcut.trim() || undefined,
      category: category.trim() || undefined,
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        padding: '8px',
        marginBottom: '4px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
      }}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') onCancel()
        }}
        style={inputStyle}
        autoFocus
      />
      <input
        type="text"
        value={shortcut}
        onChange={(e) => setShortcut(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
        }}
        placeholder="快捷键"
        style={{ ...inputStyle, width: '80px', flexShrink: 0 }}
      />
      <button
        onClick={handleSave}
        style={{
          padding: '4px 10px',
          borderRadius: '6px',
          border: 'none',
          background: 'rgba(34, 197, 94, 0.7)',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ✓
      </button>
      <button
        onClick={onCancel}
        style={{
          padding: '4px 10px',
          borderRadius: '6px',
          border: 'none',
          background: 'rgba(239, 68, 68, 0.7)',
          color: '#fff',
          fontSize: '12px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default QuickPhrasePanel
