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

export type CreateTriviaQuestionRequest = {
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
}

export type TriviaChallenge = {
  id: number
  title: string
  description: string
  questions: TriviaQuestion[]
}

export type CreateTriviaChallengeRequest = {
  title: string
  description: string
}

export async function createTriviaQuestionForChallenge(
  challengeId: number,
  question: CreateTriviaQuestionRequest
): Promise<TriviaQuestion | null> {
  try {
    const response = await apiFetch(
      `resources/trivia/challenges/${challengeId}/questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      }
    )

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaQuestion
  } catch {
    return null
  }
}

export async function updateTriviaQuestion(
  questionId: number,
  question: CreateTriviaQuestionRequest
): Promise<TriviaQuestion | null> {
  try {
    const response = await apiFetch(`resources/trivia/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaQuestion
  } catch {
    return null
  }
}

export async function deleteTriviaQuestion(
  questionId: number
): Promise<boolean> {
  try {
    const response = await apiFetch(`resources/trivia/${questionId}`, {
      method: 'DELETE',
    })

    return response.ok
  } catch {
    return false
  }
}

export async function getTriviaChallenges(): Promise<TriviaChallenge[] | null> {
  try {
    const response = await apiFetch('resources/trivia/challenges')

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaChallenge[]
  } catch {
    return null
  }
}

export async function getTriviaChallengeById(
  challengeId: number
): Promise<TriviaChallenge | null> {
  try {
    const response = await apiFetch(
      `resources/trivia/challenges/${challengeId}`
    )

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaChallenge
  } catch {
    return null
  }
}

export async function createTriviaChallenge(
  challenge: CreateTriviaChallengeRequest
): Promise<TriviaChallenge | null> {
  try {
    const response = await apiFetch('resources/trivia/challenges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(challenge),
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaChallenge
  } catch {
    return null
  }
}

export async function updateTriviaChallenge(
  challengeId: number,
  challenge: CreateTriviaChallengeRequest
): Promise<TriviaChallenge | null> {
  try {
    const response = await apiFetch(
      `resources/trivia/challenges/${challengeId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challenge),
      }
    )

    if (!response.ok) {
      return null
    }

    return (await response.json()) as TriviaChallenge
  } catch {
    return null
  }
}

export async function deleteTriviaChallenge(
  challengeId: number
): Promise<boolean> {
  try {
    const response = await apiFetch(
      `resources/trivia/challenges/${challengeId}`,
      {
        method: 'DELETE',
      }
    )

    return response.ok
  } catch {
    return false
  }
}