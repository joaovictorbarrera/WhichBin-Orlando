import { apiFetch } from './apiClient'

export type TriviaQuestion = {
  id: number
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
}

export async function getTriviaQuestions(): Promise<TriviaQuestion[] | null> {
  try {
    const response = await apiFetch('resources/trivia')

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaQuestion[]
  } catch {
    return null
  }
}