'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

type Option = {
  value: string | number
  label: string
  icon?: string // Optional icon URL/path
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
  
  // Filter out placeholder option from dropdown (but keep it for display)
  const dropdownOptions = useMemo(() => {
    if (placeholderValue === undefined) return options
    return options.filter((opt: Option) => opt.value !== placeholderValue)
  }, [options, placeholderValue])

  // Set initial hover index when opening dropdown
  useEffect(() => {
    if (isOpen && dropdownOptions.length > 0) {
      const currentIndex = dropdownOptions.findIndex(opt => opt.value === value)
      if (currentIndex === -1) {
        // Value is placeholder, start at first option
        setHoveredIndex(0)
      } else {
        setHoveredIndex(currentIndex)
      }
    } else if (!isOpen) {
      setHoveredIndex(null)
    }
  }, [isOpen, dropdownOptions, value])

  // Calculate dropdown position when opening - use requestAnimationFrame to ensure DOM is ready
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          // Use the exact button width - getBoundingClientRect includes borders
          // Since dropdown also has border and uses border-box, widths will match
          const buttonWidth = rect.width
          
          setDropdownPosition({
            top: rect.bottom + 6, // mt-1.5 = 6px (fixed positioning, no scroll offset needed)
            left: rect.left,
            width: buttonWidth, // Exact match including borders
          })
        }
      }
      
      // Use requestAnimationFrame to ensure button is rendered and positioned
      requestAnimationFrame(() => {
        requestAnimationFrame(updatePosition)
      })
      
      // Update position on scroll or resize
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

  // Close dropdown when clicking outside
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

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        return
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        let currentIndex = dropdownOptions.findIndex((opt: Option) => opt.value === value)
        
        // If current value is placeholder (not in dropdown), start at 0 or last
        if (currentIndex === -1) {
          currentIndex = e.key === 'ArrowDown' ? -1 : dropdownOptions.length
        }
        
        let newIndex: number

        if (e.key === 'ArrowDown') {
          newIndex = currentIndex < dropdownOptions.length - 1 ? currentIndex + 1 : 0
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : dropdownOptions.length - 1
        }

        if (dropdownOptions[newIndex]) {
          onChange(dropdownOptions[newIndex].value)
          setHoveredIndex(newIndex)
          
          // Scroll into view
          if (listRef.current) {
            const items = listRef.current.children
            if (items[newIndex]) {
              items[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
          }
        }
      }

      if (e.key === 'Enter' && hoveredIndex !== null && dropdownOptions[hoveredIndex]) {
        onChange(dropdownOptions[hoveredIndex].value)
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, value, dropdownOptions, hoveredIndex, onChange])

  const handleOptionClick = (optionValue: string | number) => {
    onChange(optionValue)
    setIsOpen(false)
    setHoveredIndex(null)
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-visible ${className}`}
      style={{ minWidth }}
    >
      {/* Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          input-slim w-full flex items-center justify-between gap-2
          transition-all duration-200 ease-out
          ${isOpen 
            ? 'border-accent/60 bg-gray-800/50 shadow-[0_0_0_3px_rgba(124,199,255,0.1)]' 
            : 'border-gray-600/60 hover:border-accent/40 hover:bg-gray-800/30'
          }
          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <img 
              src={selectedOption.icon} 
              alt="" 
              className="w-3.5 h-3.5 flex-shrink-0 object-contain opacity-70"
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

      {/* Dropdown Menu - Rendered in portal to avoid z-index issues */}
      {/* Only render when position is calculated to avoid flash of wrong position */}
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
            // Ensure no extra spacing that could make it appear wider
            margin: 0,
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {dropdownOptions.map((option: Option, index: number) => {
            const isSelected = option.value === value
            const isHovered = hoveredIndex === index

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleOptionClick(option.value)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  px-3 py-2 mx-1.5 rounded-md cursor-pointer
                  transition-all duration-150 ease-out
                  ${isSelected
                    ? 'bg-accent/20 text-accent font-medium'
                    : isHovered
                    ? 'bg-gray-700/60 text-white'
                    : 'text-gray-300'
                  }
                  ${isHovered || isSelected ? 'transform scale-[1.02]' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <img 
                        src={option.icon} 
                        alt="" 
                        className="w-3.5 h-3.5 flex-shrink-0 object-contain opacity-70"
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && (
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
