'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

type Option = {
  value: string | number
  label: string
  icon?: string
  meta?: string
  disabled?: boolean
}

type CustomSelectProps = {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  placeholderValue?: string | number // Value that represents "not selected" (e.g., 0, '')
  className?: string
  minWidth?: string
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  placeholderValue,
  className = '',
  minWidth = 'auto',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  const selectedOption = options.find((opt: Option) => opt.value === value)

  const dropdownOptions = useMemo(() => {
    if (placeholderValue === undefined) return options
    return options.filter((opt: Option) => opt.value !== placeholderValue)
  }, [options, placeholderValue])

  const enabledOptionCount = useMemo(
    () => dropdownOptions.filter((option) => !option.disabled).length,
    [dropdownOptions],
  )

  const getNextEnabledIndex = (
    startIndex: number,
    direction: 1 | -1,
  ): number | null => {
    if (!dropdownOptions.length || enabledOptionCount === 0) return null

    let index = startIndex
    for (let attempts = 0; attempts < dropdownOptions.length; attempts += 1) {
      index = (index + direction + dropdownOptions.length) % dropdownOptions.length
      if (!dropdownOptions[index]?.disabled) {
        return index
      }
    }

    return null
  }

  useEffect(() => {
    if (isOpen && dropdownOptions.length > 0) {
      const currentIndex = dropdownOptions.findIndex(
        (opt) => opt.value === value && !opt.disabled,
      )
      if (currentIndex !== -1) {
        setHoveredIndex(currentIndex)
        return
      }

      setHoveredIndex(dropdownOptions.findIndex((opt) => !opt.disabled))
    } else if (!isOpen) {
      setHoveredIndex(null)
    }
  }, [isOpen, dropdownOptions, value])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
          })
        }
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(updatePosition)
      })

      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    } else {
      setDropdownPosition(null)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (listRef.current && listRef.current.contains(event.target as Node)) {
          return // Don't close if clicking inside dropdown
        }
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const currentIndex =
          hoveredIndex ??
          dropdownOptions.findIndex((opt: Option) => opt.value === value)
        const newIndex = getNextEnabledIndex(
          currentIndex === -1 ? (e.key === 'ArrowDown' ? -1 : dropdownOptions.length) : currentIndex,
          e.key === 'ArrowDown' ? 1 : -1,
        )

        if (newIndex !== null && dropdownOptions[newIndex]) {
          onChange(dropdownOptions[newIndex].value)
          setHoveredIndex(newIndex)

          if (listRef.current) {
            const items = listRef.current.children
            if (items[newIndex]) {
              items[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
          }
        }
      }

      if (
        e.key === 'Enter' &&
        hoveredIndex !== null &&
        dropdownOptions[hoveredIndex] &&
        !dropdownOptions[hoveredIndex].disabled
      ) {
        onChange(dropdownOptions[hoveredIndex].value)
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabledOptionCount, getNextEnabledIndex, hoveredIndex, isOpen, onChange, dropdownOptions, value])

  const handleOptionClick = (option: Option) => {
    if (option.disabled) {
      return
    }
    onChange(option.value)
    setIsOpen(false)
    setHoveredIndex(null)
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-visible ${className}`}
      style={{ minWidth }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          input-slim w-full flex items-center justify-between gap-2
          transition-all duration-200 ease-out
          ${isOpen 
            ? 'border-accent/60 bg-gray-800/50 shadow-[0_0_0_3px_rgba(225,6,0,0.1)]'
            : 'border-gray-600/60 hover:border-accent/40 hover:bg-gray-800/30'
          }
          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && (
            <img 
              src={selectedOption.icon} 
              alt="" 
              className="w-4 h-4 flex-shrink-0 rounded-[4px] object-cover"
            />
          )}
          <span className={`truncate ${selectedOption ? 'text-white' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-accent' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <ul
          ref={listRef}
          role="listbox"
          className={`
            fixed z-[9999]
            bg-gray-900/98 backdrop-blur-md
            border border-gray-700/70
            rounded-lg shadow-2xl
            max-h-64 overflow-auto
            py-1.5
            animate-in fade-in slide-in-from-top-2 duration-200
            scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
            m-0
          `}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            minWidth: `${dropdownPosition.width}px`,
            maxWidth: `${dropdownPosition.width}px`,
            boxSizing: 'border-box',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
            margin: 0,
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {dropdownOptions.map((option: Option, index: number) => {
            const isSelected = option.value === value
            const isHovered = hoveredIndex === index
            const isDisabled = Boolean(option.disabled)

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => !isDisabled && setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  px-3 py-2 mx-1.5 rounded-md
                  transition-all duration-150 ease-out
                  ${isDisabled
                    ? 'cursor-not-allowed text-gray-500 opacity-65'
                    : isSelected
                    ? 'bg-accent/20 text-accent font-medium'
                    : isHovered
                    ? 'bg-gray-700/60 text-white'
                    : 'text-gray-300'
                  }
                  ${!isDisabled && (isHovered || isSelected) ? 'transform scale-[1.02]' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {option.icon && (
                      <img 
                        src={option.icon} 
                        alt="" 
                        className="w-4 h-4 flex-shrink-0 rounded-[4px] object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate">{option.label}</div>
                      {option.meta && (
                        <div className="truncate text-[11px] uppercase tracking-wide text-gray-500">
                          {option.meta}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && !isDisabled && (
                    <svg
                      className="w-4 h-4 text-accent ml-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </li>
            )
          })}
        </ul>,
        document.body
      )}
    </div>
  )
}
