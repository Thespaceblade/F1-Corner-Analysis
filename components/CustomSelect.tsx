'use client'

import React, { useState, useRef, useEffect } from 'react'

type Option = {
  value: string | number
  label: string
}

type CustomSelectProps = {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  className?: string
  minWidth?: string
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  minWidth = 'auto',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
        const currentIndex = options.findIndex(opt => opt.value === value)
        let newIndex = currentIndex

        if (e.key === 'ArrowDown') {
          newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
        } else {
          newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
        }

        onChange(options[newIndex].value)
        setHoveredIndex(newIndex)
        
        // Scroll into view
        if (listRef.current) {
          const items = listRef.current.children
          if (items[newIndex]) {
            items[newIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
          }
        }
      }

      if (e.key === 'Enter' && hoveredIndex !== null) {
        onChange(options[hoveredIndex].value)
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, value, options, hoveredIndex, onChange])

  const handleOptionClick = (optionValue: string | number) => {
    onChange(optionValue)
    setIsOpen(false)
    setHoveredIndex(null)
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ minWidth }}
    >
      {/* Select Button */}
      <button
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
        <span className={`truncate ${selectedOption ? 'text-white' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-accent' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={`
            absolute z-50 w-full mt-1.5
            bg-gray-900/98 backdrop-blur-md
            border border-gray-700/70
            rounded-lg shadow-2xl
            max-h-64 overflow-auto
            py-1.5
            animate-in fade-in slide-in-from-top-2 duration-200
            scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
          `}
          style={{
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
          }}
        >
          {options.map((option, index) => {
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
                  <span className="truncate">{option.label}</span>
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
        </ul>
      )}
    </div>
  )
}

