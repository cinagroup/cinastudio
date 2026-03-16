import React, { useCallback, useRef, useEffect, useState } from 'react'
import { useTextSelection, type TextSelection } from '../hooks/useTextSelection'

export interface SelectionAssistantProps {
  /** Custom action buttons (overrides defaults) */
  actions?: SelectionAction[]
  /** Callback when an action is triggered */
  onAction?: (action: string, text: string) => void
  /** Position offset X (default: 0) */
  offsetX?: number
  /** Position offset Y (default: 10) */
  offsetY?: number
  /** Z-index for the menu (default: 9999) */
  zIndex?: number
}

export interface SelectionAction {
  key: string
  label: string
  icon?: string
  handler: (text: string) => void | Promise<void>
}

const DEFAULT_ACTIONS: SelectionAction[] = [
  {
    key: 'translate',
    label: '翻译',
    icon: '🌐',
    handler: async (text) => {
      // Placeholder: integrate with translation API
      console.log('[SelectionAssistant] Translate:', text)
    },
  },
  {
    key: 'search',
    label: '搜索',
    icon: '🔍',
    handler: async (text) => {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank')
    },
  },
  {
    key: 'summarize',
    label: '总结',
    icon: '📝',
    handler: async (text) => {
      // Placeholder: integrate with LLM summarization API
      console.log('[SelectionAssistant] Summarize:', text)
    },
  },
  {
    key: 'copy',
    label: '复制',
    icon: '📋',
    handler: async (text) => {
      await navigator.clipboard.writeText(text)
    },
  },
]

export const SelectionAssistant: React.FC<SelectionAssistantProps> = ({
  actions,
  onAction,
  offsetX = 0,
  offsetY = 10,
  zIndex = 9999,
}) => {
  const { selection, floatingMenuVisible, hideFloatingMenu } = useTextSelection({
    minLength: 1,
    debounceMs: 150,
  })

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const effectiveActions = actions ?? DEFAULT_ACTIONS

  // Update position when selection changes
  useEffect(() => {
    if (floatingMenuVisible && selection.rect) {
      const x = selection.rect.left + selection.rect.width / 2 + offsetX
      const y = selection.rect.top + window.scrollY - offsetY
      setPosition({ x, y })
    }
  }, [floatingMenuVisible, selection.rect, offsetX, offsetY])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideFloatingMenu()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hideFloatingMenu])

  const handleAction = useCallback(
    async (action: SelectionAction) => {
      if (!selection.text) return
      setLoading(action.key)
      try {
        await action.handler(selection.text)
        onAction?.(action.key, selection.text)
      } catch (err) {
        console.error(`[SelectionAssistant] Action "${action.key}" failed:`, err)
      } finally {
        setLoading(null)
        hideFloatingMenu()
      }
    },
    [selection.text, onAction, hideFloatingMenu]
  )

  if (!floatingMenuVisible || !selection.text) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="文本操作菜单"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        zIndex,
        display: 'flex',
        gap: '4px',
        padding: '6px 8px',
        background: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {effectiveActions.map((action) => (
        <button
          key={action.key}
          role="menuitem"
          onClick={() => handleAction(action)}
          disabled={loading !== null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            border: 'none',
            borderRadius: '6px',
            background: 'transparent',
            color: '#fff',
            fontSize: '13px',
            cursor: loading !== null ? 'not-allowed' : 'pointer',
            opacity: loading !== null ? 0.5 : 1,
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLElement).style.background = 'transparent'
          }}
          title={action.label}
        >
          {action.icon && <span style={{ fontSize: '15px' }}>{action.icon}</span>}
          <span>{action.label}</span>
          {loading === action.key && (
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          )}
        </button>
      ))}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SelectionAssistant
