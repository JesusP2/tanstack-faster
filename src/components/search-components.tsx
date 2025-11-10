import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getSearchResults } from '@/lib/functions'
import { useRouteContext } from '@tanstack/react-router'

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  return [debouncedValue, setDebouncedValue] as const
}

interface AutoCompleteProps {
  value?: string
  onChange?: (value: string) => void
}

export default function Autocomplete({ value = '', onChange }: AutoCompleteProps) {
  const context = useRouteContext({
    from: '__root__'
  })
  const [query, setQuery] = useState(value)
  const [debouncedQuery] = useDebounce(query, 300)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const fn = useServerFn(getSearchResults)
  const { data: suggestions, isRefetching: isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetchSuggestionsCallback(debouncedQuery),
    initialData: [],
  })

  const fetchSuggestionsCallback = async (q: string) => {
    if (q.trim() === '') {
      return []
    }
    const results = await fn({
      data: { searchTerm: q },
    })
    return results
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      setQuery(suggestions[selectedIndex].name)
      context.queryClient.setQueryData(['search', debouncedQuery], [])
      setSelectedIndex(-1)
    } else if (e.key === 'Escape') {
      context.queryClient.setQueryData(['search', debouncedQuery], [])
      setSelectedIndex(-1)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    onChange?.(suggestion)
    context.queryClient.setQueryData(['search', debouncedQuery], [])
    setSelectedIndex(-1)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events on suggestions
    setTimeout(() => {
      setIsFocused(false)
      context.queryClient.setQueryData(['search', debouncedQuery], [])
      setSelectedIndex(-1)
    }, 200)
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pr-10"
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={suggestions.length > 0}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {isLoading && isFocused && (
        <div
          className="mt-2 p-2 bg-background border rounded-md shadow-sm absolute z-10"
          aria-live="polite"
        >
          Loading...
        </div>
      )}
      {suggestions.length > 0 && !isLoading && isFocused && (
        <ul
          id="suggestions-list"
          className="mt-2 bg-background border rounded-md shadow-sm absolute z-10"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.slug}
              className={`px-4 py-2 cursor-pointer hover:bg-muted ${
                index === selectedIndex ? 'bg-muted' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion.name)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
