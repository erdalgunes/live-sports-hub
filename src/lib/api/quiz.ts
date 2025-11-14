// Quiz API client following API-first design
import type {
  StartQuizRequest,
  StartQuizResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  GetCategoriesResponse,
  GetLeaderboardResponse,
  GetLeaderboardRequest,
} from '@/types/quiz'

class QuizAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'QuizAPIError'
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`/api/quiz${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new QuizAPIError(data.error || 'API request failed', response.status, data.details)
    }

    return data as T
  } catch (error) {
    if (error instanceof QuizAPIError) throw error
    throw new QuizAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    )
  }
}

export const quizAPI = {
  /**
   * Get all available quiz categories with question counts
   */
  getCategories: async (): Promise<GetCategoriesResponse> => {
    return fetchAPI<GetCategoriesResponse>('/categories')
  },

  /**
   * Start a new quiz session
   */
  startQuiz: async (request: StartQuizRequest): Promise<StartQuizResponse> => {
    return fetchAPI<StartQuizResponse>('/start', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  /**
   * Submit an answer for the current question
   */
  submitAnswer: async (request: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
    return fetchAPI<SubmitAnswerResponse>('/answer', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  /**
   * Get leaderboard rankings
   */
  getLeaderboard: async (params?: GetLeaderboardRequest): Promise<GetLeaderboardResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.timeframe) searchParams.set('timeframe', params.timeframe)

    const query = searchParams.toString()
    return fetchAPI<GetLeaderboardResponse>(`/leaderboard${query ? `?${query}` : ''}`)
  },
}

export { QuizAPIError }
