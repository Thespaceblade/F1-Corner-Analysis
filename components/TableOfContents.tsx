'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'

type TOCSection = {
  id: string
  label: string
  level: number
}

type TableOfContentsProps = {
  sections: TOCSection[]
  isVisible?: boolean
  variant?: 'sidebar' | 'header'
}

export default function TableOfContents({ 
  sections, 
  isVisible = true,
  variant = 'sidebar'
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sectionsRef = useRef<Map<string, IntersectionObserverEntry>>(new Map())

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    const element = document.getElementById(sectionId)
    if (element) {
      // Account for fixed header/toolbar (approximately 120px)
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      
      // Close mobile drawer if open
      setIsMobileOpen(false)
      
      // Update active section immediately for better UX
      setActiveSection(sectionId)
    }
  }, [])

  // Intersection Observer setup
  useEffect(() => {
    if (!isVisible || sections.length === 0) return

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in upper portion of viewport
      threshold: [0, 0.1, 0.5, 1]
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sectionsRef.current.set(entry.target.id, entry)
        } else {
          sectionsRef.current.delete(entry.target.id)
        }
      })

      // Find the most visible section
      if (sectionsRef.current.size > 0) {
        const visibleEntries = Array.from(sectionsRef.current.values())
        
        // Sort by intersection ratio and position
        visibleEntries.sort((a, b) => {
          // Prefer sections with higher intersection ratio
          if (Math.abs(b.intersectionRatio - a.intersectionRatio) > 0.1) {
            return b.intersectionRatio - a.intersectionRatio
          }
          // If ratios are similar, prefer the one higher on the page
          return a.boundingClientRect.top - b.boundingClientRect.top
        })

        const mostVisible = visibleEntries[0]
        if (mostVisible) {
          setActiveSection(mostVisible.target.id)
        }
      } else {
        // If no sections are visible, check scroll position to determine active section
        if (typeof window !== 'undefined') {
          const scrollPosition = window.pageYOffset + 150
          
          for (let i = sections.length - 1; i >= 0; i--) {
            const element = document.getElementById(sections[i].id)
            if (element) {
              const elementTop = element.offsetTop
              if (scrollPosition >= elementTop) {
                setActiveSection(sections[i].id)
                break
              }
            }
          }
        }
      }
    }

    // Only create IntersectionObserver in browser environment
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(handleIntersection, observerOptions)

      // Observe all sections
      if (typeof document !== 'undefined') {
        sections.forEach(section => {
          const element = document.getElementById(section.id)
          if (element && observerRef.current) {
            observerRef.current.observe(element)
          }
        })
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      sectionsRef.current.clear()
    }
  }, [sections, isVisible])

  // Close mobile drawer when clicking backdrop
  useEffect(() => {
    if (isMobileOpen && typeof document !== 'undefined') {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.classList.contains('toc-backdrop')) {
          setIsMobileOpen(false)
        }
      }
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [isMobileOpen])

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isMobileOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMobileOpen])

  // Header variant - integrated into header
  if (variant === 'header') {
    // Don't return null for header variant - let it render even if no sections
    // The parent component handles visibility
    return (
      <>
        {/* Mobile Toggle Button */}
        {sections.length > 0 && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="toc-mobile-toggle lg:hidden"
            aria-label="Open table of contents"
            aria-expanded={isMobileOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Mobile Backdrop */}
        {isMobileOpen && sections.length > 0 && (
          <div
            className="toc-backdrop lg:hidden open"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Header-integrated TOC - Desktop */}
        {sections.length > 0 && isVisible && (
          <div
            className={`toc-header-nav ${isHovered ? 'expanded' : 'collapsed'}`}
            aria-label="Table of contents"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Icon when collapsed - always visible */}
            <div className="toc-header-icon">
              <svg
                className="toc-header-icon-svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            
            {/* Expanded content */}
            <div className="toc-header-content">
              <nav className="toc-header-nav-list">
                {sections.map((section) => {
                  const isActive = activeSection === section.id
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => scrollToSection(section.id, e)}
                      className={`toc-header-item ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'location' : undefined}
                    >
                      {section.label}
                    </a>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Drawer */}
        <aside
          className={`toc-drawer lg:hidden ${isMobileOpen ? 'open' : ''}`}
          aria-label="Table of contents"
          aria-hidden={!isMobileOpen}
        >
          <div className="toc-drawer-header">
            <h3 className="toc-title">Contents</h3>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="toc-close-button"
              aria-label="Close table of contents"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="toc-nav">
            {sections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => scrollToSection(section.id, e)}
                  className={`toc-item ${isActive ? 'active' : ''}`}
                  style={{
                    paddingLeft: `${12 + (section.level - 1) * 16}px`,
                  }}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {section.label}
                </a>
              )
            })}
          </nav>
        </aside>
      </>
    )
  }

  // Sidebar variant - original fixed sidebar
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="toc-mobile-toggle lg:hidden"
        aria-label="Open table of contents"
        aria-expanded={isMobileOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="toc-backdrop lg:hidden open"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar - Collapsible on Hover */}
      <aside
        ref={sidebarRef}
        className={`toc-sidebar hidden lg:block ${isHovered ? 'expanded' : 'collapsed'}`}
        aria-label="Table of contents"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Icon when collapsed - perfectly centered */}
        <div className="toc-icon-container">
          <svg
            className="toc-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
        
        {/* Expanded content */}
        <div className="toc-content">
          <div className="toc-header">
            <h3 className="toc-title">Contents</h3>
          </div>
          <nav className="toc-nav">
            {sections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => scrollToSection(section.id, e)}
                  className={`toc-item ${isActive ? 'active' : ''}`}
                  style={{
                    paddingLeft: `${12 + (section.level - 1) * 16}px`,
                  }}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {section.label}
                </a>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`toc-drawer lg:hidden ${isMobileOpen ? 'open' : ''}`}
        aria-label="Table of contents"
        aria-hidden={!isMobileOpen}
      >
        <div className="toc-drawer-header">
          <h3 className="toc-title">Contents</h3>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="toc-close-button"
            aria-label="Close table of contents"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="toc-nav">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => scrollToSection(section.id, e)}
                className={`toc-item ${isActive ? 'active' : ''}`}
                style={{
                  paddingLeft: `${12 + (section.level - 1) * 16}px`,
                }}
                aria-current={isActive ? 'location' : undefined}
              >
                {section.label}
              </a>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

