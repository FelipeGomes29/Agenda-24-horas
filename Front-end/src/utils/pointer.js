export function getPointer(event) {
  if (!event) return null
  const touch = event.touches?.[0] ?? event.changedTouches?.[0]
  if (touch) return { x: touch.clientX, y: touch.clientY }
  if (typeof event.clientX === 'number') return { x: event.clientX, y: event.clientY }
  return null
}

export const INBOX_GRAB = { x: 14, y: 10 }

export function snapInboxToCursor({ activatorEvent, draggingNodeRect, transform }) {
  const p = getPointer(activatorEvent)
  if (!p || !draggingNodeRect) return transform
  return {
    ...transform,
    x: transform.x + p.x - draggingNodeRect.left - INBOX_GRAB.x,
    y: transform.y + p.y - draggingNodeRect.top - INBOX_GRAB.y,
  }
}
