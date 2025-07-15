'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './TagInput.module.css'

interface TagSuggestion {
  id: number
  name: string
  count: number
}

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
}

export default function TagInput({ 
  tags, 
  onTagsChange, 
  maxTags = 5, 
  placeholder = 'タグを入力してください' 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.trim().length < 1) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      try {
        const response = await fetch(`/api/tags/suggest?q=${encodeURIComponent(inputValue)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.filter((tag: TagSuggestion) => !tags.includes(tag.name)))
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('タグサジェスト取得エラー:', error)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [inputValue, tags])

  const addTag = (tagName: string) => {
    if (tagName.trim() && !tags.includes(tagName.trim()) && tags.length < maxTags) {
      onTagsChange([...tags, tagName.trim()])
      setInputValue('')
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        addTag(suggestions[activeSuggestion].name)
      } else {
        addTag(inputValue)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setActiveSuggestion(-1)
  }

  const handleSuggestionClick = (suggestion: TagSuggestion) => {
    addTag(suggestion.name)
  }

  const handleInputBlur = () => {
    // 少し遅延させてクリックイベントを先に処理
    setTimeout(() => {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }, 200)
  }

  const handleInputFocus = () => {
    if (inputValue.trim().length >= 1) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.tagsContainer}>
        {tags.map(tag => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className={styles.tagRemoveButton}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={styles.input}
            placeholder={tags.length >= maxTags ? `最大${maxTags}個まで` : placeholder}
            disabled={tags.length >= maxTags}
          />
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            disabled={tags.length >= maxTags || !inputValue.trim()}
            className={styles.addButton}
          >
            追加
          </button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`${styles.suggestion} ${
                  index === activeSuggestion ? styles.suggestionActive : ''
                }`}
              >
                <span className={styles.suggestionName}>{suggestion.name}</span>
                <span className={styles.suggestionCount}>{suggestion.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}