import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  /** Key combination e.g. 'ctrl+k', 'ctrl+shift+n' */
  key: string
  /** Handler function */
  handler: (e: KeyboardEvent) => void
  /** Whether this shortcut is currently active (default: true) */
  enabled?: boolean
  /** Description for help panel */
  description?: string
}

export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are globally enabled (default: true) */
  enabled?: boolean
}

export interface UseKeyboardShortcutsReturn {
  /** Register a new shortcut dynamically */
  register: (shortcut: KeyboardShortcut) => void
  /** Unregister a shortcut by key */
  unregister: (key: string) => void
  /** Check if a key combo is already registered */
  isRegistered: (key: string) => boolean
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/mod/i, navigator.platform.includes('Mac') ? 'meta' : 'ctrl')
}

function matchesShortcut(event: KeyboardEvent, pattern: string): boolean {
  const parts = normalizeKey(pattern).split('+')
  const key = parts.pop()!

  const ctrlOk = parts.includes('ctrl') === event.ctrlKey
  const shiftOk = parts.includes('shift') === event.shiftKey
  const altOk = parts.includes('alt') === event.altKey
  const metaOk = parts.includes('meta') === event.metaKey

  const keyOk = event.key.toLowerCase() === key

  // Ensure no extra modifiers pressed (unless in pattern)
  const noExtra =
    (parts.includes('ctrl') || !event.ctrlKey) &&
    (parts.includes('shift') || !event.shiftKey) &&
    (parts.includes('alt') || !event.altKey) &&
    (parts.includes('meta') || !event.metaKey)

  return keyOk && ctrlOk && shiftOk && altOk && metaOk && noExtra
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const { enabled = true } = options
  const shortcutsRef = useRef(new Map<string, KeyboardShortcut>())

  // Keep ref in sync with shortcuts array
  useEffect(() => {
    shortcutsRef.current.clear()
    for (const s of shortcuts) {
      if (s.enabled !== false) {
        shortcutsRef.current.set(normalizeKey(s.key), s)
      }
    }
  }, [shortcuts])

  const register = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current.set(normalizeKey(shortcut.key), shortcut)
  }, [])

  const unregister = useCallback((key: string) => {
    shortcutsRef.current.delete(normalizeKey(key))
  }, [])

  const isRegistered = useCallback((key: string) => {
    return shortcutsRef.current.has(normalizeKey(key))
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs (e.g., Escape)
        if (e.key !== 'Escape') return
      }

      for (const [pattern, shortcut] of shortcutsRef.current) {
        if (matchesShortcut(e, pattern)) {
          e.preventDefault()
          e.stopPropagation()
          shortcut.handler(e)
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [enabled])

  return { register, unregister, isRegistered }
}

/* ─── Preset shortcuts for Cherry Studio Web ─── */

export interface StudioShortcutCallbacks {
  onSearch?: () => void
  onNewConversation?: () => void
  onNewAssistant?: () => void
  onExport?: () => void
  onQuickPhrase?: () => void
  enabled?: boolean
}

export function useStudioShortcuts(callbacks: StudioShortcutCallbacks) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'ctrl+k',
      handler: () => callbacks.onSearch?.(),
      description: '搜索',
    },
    {
      key: 'ctrl+n',
      handler: () => callbacks.onNewConversation?.(),
      description: '新对话',
    },
    {
      key: 'ctrl+shift+n',
      handler: () => callbacks.onNewAssistant?.(),
      description: '新助手',
    },
    {
      key: 'ctrl+e',
      handler: () => callbacks.onExport?.(),
      description: '导出',
    },
    {
      key: 'ctrl+/',
      handler: () => callbacks.onQuickPhrase?.(),
      description: '快捷短语面板',
    },
  ]

  return useKeyboardShortcuts(shortcuts, {
    enabled: callbacks.enabled ?? true,
  })
}
