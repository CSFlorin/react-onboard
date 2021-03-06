import React, { useState, useEffect, cloneElement, FC } from 'react'
import { useOnboard } from './OnboardProvider'
import { OnboardElementProps } from './types'

/**
 * Wrapper for element to be highlighted with badge during an onboard message
 */
export const OnboardElement: FC<OnboardElementProps> = ({
  id,
  children,
  ackOnClick = true,
  ackOnMouseOver = 1000
}) => {
  const [isActive, setIsActive] = useState(false)
  const {
    onElementRender,
    onElementUnrender,
    activeMessage,
    ackMessage,
    HighlightComponent
  } = useOnboard()

  useEffect(() => {
    onElementRender(id)

    return () => onElementUnrender(id)
  }, [])

  useEffect(() => {
    setIsActive(Boolean(activeMessage?.elementIds?.includes(id)))

    return () => setIsActive(false)
  }, [activeMessage])

  const dismiss = () => {
    if (isActive) ackMessage(activeMessage!.id!)
  }

  const [dismissTimeout, setDismissTimeout] = useState<number>()

  const newChildren = cloneElement(children as any, {
    ...(children as any).props,
    style: { visibility: 'initial', ...(children as any).props.style }
  })

  return (
    <HighlightComponent
      onClick={() => {
        if (ackOnClick) {
          dismiss()
          window.clearTimeout(dismissTimeout)
          setDismissTimeout(undefined)
        }
      }}
      onMouseOver={() => {
        if (ackOnMouseOver > 0 && dismissTimeout === undefined)
          setDismissTimeout(window.setTimeout(dismiss, ackOnMouseOver))
      }}
      onMouseLeave={() => {
        if (ackOnMouseOver > 0) {
          window.clearTimeout(dismissTimeout)
          setDismissTimeout(undefined)
        }
      }}
      style={{ visibility: isActive ? 'initial' : 'hidden' }}
    >
      {newChildren}
    </HighlightComponent>
  )
}
