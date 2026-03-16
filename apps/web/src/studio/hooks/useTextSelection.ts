import { useCallback, useEffect, useRef, useState } from 'react'

export interface TextSelection {
  text: string
  rect: DOMRect | null
  startNode: Node | null
  endNode: Node | null
}

export interface UseTextSelectionOptions {
  /** Minimum text length to trigger selection (default: 1) */
  minLength?: number
  /** Debounce in ms (default: 150) */
  debounceMs?: number
}

export interface UseTextSelectionReturn {
  selection: TextSelection
  isSelecting: boolean
  showFloatingMenu: () => void
  hideFloatingMenu: () => void
  floatingMenuVisible: boolean
}

function getSelectionInfo(): TextSelection {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
    return { text: '', rect: null, startNode: null, endNode: null }
  }
  const range = sel.getRangeAt(0)
  const text = sel.toString().trim()
  const rect = range.getBoundingClientRect()
  return {
    text,
    rect: rect.width > 0 ? rect : null,
    startNode: range.startContainer,
    endNode: range.endContainer,
  }
}

export function useTextSelection(
  options: UseTextSelectionOptions = {}
): UseTextSelectionReturn {
  const { minLength = 1, debounceMs = 150 } = options

  const [selection, setSelection] = useState<TextSelection>({
    text: '',
    rect: null,
    startNode: null,
    endNode: null,
  })
  const [isSelecting, setIsSelecting] = useState(false)
  const [floatingMenuVisible, setFloatingMenuVisible] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTextRef = useRef('')

  const hideFloatingMenu = useCallback(() => {
    setFloatingMenuVisible(false)
  }, [])

  const showFloatingMenu = useCallback(() => {
    if (selection.text.length >= minLength) {
      setFloatingMenuVisible(true)
    }
  }, [selection.text, minLength])

  // Watch for selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        const info = getSelectionInfo()

        if (info.text !== lastTextRef.current) {
          lastTextRef.current = info.text
          setSelection(info)
          setIsSelecting(info.text.length > 0)

          // Auto-show floating menu on meaningful selection
          if (info.text.length >= minLength && info.rect) {
            setFloatingMenuVisible(true)
          } else {
            setFloatingMenuVisible(false)
          }
        }
      }, debounceMs)
    }

    const handleMouseDown = () => {
      // Hide menu when clicking outside
      setFloatingMenuVisible(false)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mousedown', handleMouseDown)
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [minLength, debounceMs])

  return {
    selection,
    isSelecting,
    showFloatingMenu,
    hideFloatingMenu,
    floatingMenuVisible,
  }
}
