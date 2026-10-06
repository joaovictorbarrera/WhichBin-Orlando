import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiInfo,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import {
  getTriviaChallengeById,
  type TriviaChallenge,
} from '../services/triviaService'
import PageLayout from '../components/PageLayout'
import './ResourceDetails.css'

function TriviaChallengeDetails() {
  const { challengeId } = useParams()

  const [challenge, setChallenge] = useState<TriviaChallenge | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  useEffect(() => {
    if (!challengeId) {
      setLoading(false)
      return
    }

    const id = Number(challengeId)

    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false)
      return
    }

    let isMounted = true

    getTriviaChallengeById(id)
      .then((data) => {
        if (isMounted) {
          setChallenge(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setChallenge(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [challengeId])

  function handleAnswer(answer: string) {
    const question = challenge?.questions[currentQuestion]

    if (
      !question ||
      selectedAnswer !== null ||
      quizComplete
    ) {
      return
    }

    setSelectedAnswer(answer)

    if (answer === question.correctAnswer) {
      setScore((currentScore) => currentScore + 1)
    }
  }

  function handleNextQuestion() {
    if (!challenge) {
      return
    }

    if (currentQuestion === challenge.questions.length - 1) {
      setQuizComplete(true)
      return
    }

    setCurrentQuestion((current) => current + 1)
    setSelectedAnswer(null)
  }

  function restartQuiz() {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizComplete(false)
  }

  function getAnswerClass(answer: string) {
    const question = challenge?.questions[currentQuestion]

    if (!question || selectedAnswer === null) {
      return 'trivia-answer'
    }

    if (answer === question.correctAnswer) {
      return 'trivia-answer trivia-answer-correct'
    }

    if (answer === selectedAnswer) {
      return 'trivia-answer trivia-answer-wrong'
    }

    return 'trivia-answer'
  }

  if (loading) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <div className="resource-loading-message">
            Loading challenge...
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!challenge) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <div className="resource-empty-icon">
            <FiInfo aria-hidden="true" />
          </div>

          <h1>Challenge Not Found</h1>

          <p>
            This trivia challenge could not be found.
          </p>
        </div>
      </PageLayout>
    )
  }

  if (challenge.questions.length === 0) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <div className="resource-hero resource-hero-green">
            <div className="resource-hero-icon">
              <FaRecycle aria-hidden="true" />
            </div>

            <div>
              <p className="resource-hero-label">
                Interactive Challenge
              </p>

              <h1>{challenge.title}</h1>

              <p>{challenge.description}</p>
            </div>
          </div>

          <div className="resource-empty-message">
            There are no challenge questions available right now.
          </div>
        </div>
      </PageLayout>
    )
  }

  if (quizComplete) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <div className="resource-complete">
            <div className="resource-complete-icon">
              <FaRecycle aria-hidden="true" />
            </div>

            <p className="resource-hero-label">
              Challenge Complete
            </p>

            <h1>Great Job!</h1>

            <p>
              You scored {score} out of {challenge.questions.length}.
            </p>

            <button
              type="button"
              className="trivia-button"
              onClick={restartQuiz}
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    )
  }

  const question = challenge.questions[currentQuestion]

  const answers = [
    question.answerA,
    question.answerB,
    question.answerC,
    question.answerD,
  ]

  return (
    <PageLayout className="resource-details-page" width="wide">
      <Link to="/resources" className="resource-back-link">
        <FiArrowLeft aria-hidden="true" />
        Back to Educational Resources
      </Link>

      <div className="resource-details-card">
        <div className="resource-hero resource-hero-green">
          <div className="resource-hero-icon">
            <FaRecycle aria-hidden="true" />
          </div>

          <div>
            <p className="resource-hero-label">
              Interactive Challenge
            </p>

            <h1>{challenge.title}</h1>

            <p>{challenge.description}</p>
          </div>
        </div>

        <div className="trivia-progress">
          <span>
            Question {currentQuestion + 1} of {challenge.questions.length}
          </span>

          <div className="trivia-progress-bar">
            <div
              className="trivia-progress-fill"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    challenge.questions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <section className="trivia-question">
          <h2>{question.question}</h2>

          <div className="trivia-answers">
            {answers.map((answer) => (
              <button
                type="button"
                className={getAnswerClass(answer)}
                onClick={() => handleAnswer(answer)}
                disabled={selectedAnswer !== null}
                key={answer}
              >
                {answer}
              </button>
            ))}
          </div>

          {selectedAnswer !== null && (
            <div className="trivia-next">
              <p>
                {selectedAnswer === question.correctAnswer
                  ? 'Correct!'
                  : `Not quite. The correct answer is ${question.correctAnswer}.`}
              </p>

              <button
                type="button"
                className="trivia-button"
                onClick={handleNextQuestion}
              >
                {currentQuestion === challenge.questions.length - 1
                  ? 'Finish'
                  : 'Next Question'}
              </button>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  )
}

export default TriviaChallengeDetails