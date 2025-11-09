'use client'

import React, { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  data?: any
  timestamp: Date
}

type ChatbotResponse = {
  answer: string
  data?: any
  sources?: string[]
  followUpSuggestions?: string[]
  confidence?: number
}

type ChatbotProps = {
  context?: {
    track?: string
    year?: number
    session?: string
    drivers?: string[]
  }
}

export default function Chatbot({ context }: ChatbotProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async (query: string) => {
    if (!query.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: extractContext(messages),
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ChatbotResponse = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        data: data.data,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response'
      setError(errorMessage)
      const errorMsg: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const extractContext = (messages: Message[]): any => {
    // Extract context from recent messages and page context
    const recentMessages = messages.slice(-5) // Last 5 messages
    return {
      lastTrack: context?.track,
      lastYear: context?.year,
      lastSession: context?.session,
      lastDriver: context?.drivers?.[0],
      messages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--accent-clr)] text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] panel flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-clr)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-clr)] flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-clr)]">
                  F1 Corner Analyst
                </h3>
                <p className="text-xs text-[var(--subtext-clr)]">
                  Ask me about corner performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-[var(--surface-bg)] rounded transition-colors"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <svg
                  className="w-4 h-4 text-[var(--subtext-clr)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-[var(--surface-bg)] rounded transition-colors"
                aria-label="Close chatbot"
              >
                <svg
                  className="w-4 h-4 text-[var(--subtext-clr)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-[var(--subtext-clr)] text-sm py-8">
                <p className="mb-2">👋 Hello! I'm your F1 corner analysis assistant.</p>
                <p className="mb-4">Try asking me:</p>
                <div className="space-y-2 text-left">
                  <button
                    onClick={() => handleSuggestionClick("Who was fastest at corner 8 at Monaco 2025?")}
                    className="block w-full text-left p-2 rounded hover:bg-[var(--surface-bg)] text-xs text-[var(--accent-clr)] transition-colors"
                  >
                    "Who was fastest at corner 8 at Monaco 2025?"
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Compare VER and HAM at corner 3")}
                    className="block w-full text-left p-2 rounded hover:bg-[var(--surface-bg)] text-xs text-[var(--accent-clr)] transition-colors"
                  >
                    "Compare VER and HAM at corner 3"
                  </button>
                  <button
                    onClick={() => handleSuggestionClick("Which corner is VER strongest at?")}
                    className="block w-full text-left p-2 rounded hover:bg-[var(--surface-bg)] text-xs text-[var(--accent-clr)] transition-colors"
                  >
                    "Which corner is VER strongest at?"
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-[var(--accent-clr)] text-white'
                      : 'bg-[var(--surface-bg)] text-[var(--text-clr)] border border-[var(--border-clr)]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.data && (
                    <div className="mt-2 pt-2 border-t border-[var(--border-clr)] text-xs text-[var(--subtext-clr)]">
                      {message.data.cornerNumber && (
                        <div>Corner: {message.data.cornerNumber}</div>
                      )}
                      {message.data.driverCode && (
                        <div>Driver: {message.data.driverCode}</div>
                      )}
                      {message.data.track && (
                        <div>Track: {message.data.track}</div>
                      )}
                      {message.data.metrics && (
                        <div>
                          {message.data.metrics.cornerTime && (
                            <div>Time: {message.data.metrics.cornerTime.toFixed(3)}s</div>
                          )}
                          {message.data.metrics.delta && (
                            <div>Delta: {message.data.metrics.delta > 0 ? '+' : ''}{message.data.metrics.delta.toFixed(3)}s</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--surface-bg)] rounded-lg px-3 py-2 border border-[var(--border-clr)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[var(--accent-clr)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--accent-clr)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[var(--accent-clr)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--border-clr)]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about corner performance..."
                className="flex-1 input-slim text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-[var(--accent-clr)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
            {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="mt-2 flex flex-wrap gap-2">
                {messages[messages.length - 1]?.data?.followUpSuggestions?.slice(0, 2).map((suggestion: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-2 py-1 rounded bg-[var(--surface-bg)] text-[var(--accent-clr)] hover:bg-[var(--border-clr)] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

