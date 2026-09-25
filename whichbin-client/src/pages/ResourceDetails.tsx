import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import {
  getResourceById,
  type Resource,
} from '../services/resourceService'
import {
  getTriviaQuestions,
  type TriviaQuestion,
} from '../services/triviaService'
import PageLayout from '../components/PageLayout'
import './ResourceDetails.css'

function ResourceDetails() {
  const { resourceId } = useParams()

  const [resource, setResource] = useState<Resource | null>(null)
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[] | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resourceId) {
      return
    }

    let isMounted = true

    getResourceById(resourceId)
      .then((data) => {
        if (isMounted) {
          setResource(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setResource(null)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [resourceId])

  useEffect(() => {
    if (resource?.title !== 'Take the Challenge') {
      return
    }

    let isMounted = true

    getTriviaQuestions()
      .then((questions) => {
        if (isMounted) {
          setTriviaQuestions(questions)
        }
      })
      .catch(() => {
        if (isMounted) {
          setTriviaQuestions(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [resource])

  const triviaLoading =
    resource?.title === 'Take the Challenge' && triviaQuestions === null

  function handleAnswer(answer: string) {
    if (selectedAnswer !== null || quizComplete) {
      return
    }

    setSelectedAnswer(answer)

    if (answer === triviaQuestions?.[currentQuestion]?.correctAnswer) {
      setScore((currentScore) => currentScore + 1)
    }
  }

  function handleNextQuestion() {
    if (currentQuestion === (triviaQuestions?.length ?? 0) - 1) {
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
    if (selectedAnswer === null) {
      return 'trivia-answer'
    }

    if (answer === triviaQuestions?.[currentQuestion]?.correctAnswer) {
      return 'trivia-answer trivia-answer-correct'
    }

    if (answer === selectedAnswer) {
      return 'trivia-answer trivia-answer-wrong'
    }

    return 'trivia-answer'
  }

  if (loading && resourceId) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1 aria-live="polite">Loading resource...</h1>
        </div>
      </PageLayout>
    )
  }

  if (!resource || !resourceId) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <div className="resource-details-card">
          <h1>Resource Not Found</h1>
          <p>Resource not found.</p>
        </div>
      </PageLayout>
    )
  }

  if (resource.title === 'Take the Challenge') {
    if (triviaLoading) {
      return (
        <PageLayout className="resource-details-page" width="wide">
          <Link to="/resources" className="resource-back-link">
            <FiArrowLeft aria-hidden="true" />
            Back to Educational Resources
          </Link>

          <div className="resource-details-card">
            <h1>{resource.title}</h1>
            <p>{resource.description}</p>
            <p>Loading challenge questions...</p>
          </div>
        </PageLayout>
      )
    }

    if (!triviaQuestions?.length) {
      return (
        <PageLayout className="resource-details-page" width="wide">
          <Link to="/resources" className="resource-back-link">
            <FiArrowLeft aria-hidden="true" />
            Back to Educational Resources
          </Link>

          <div className="resource-details-card">
            <h1>{resource.title}</h1>
            <p>{resource.description}</p>
            <p>There are no challenge questions available right now.</p>
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
            <h1>Challenge Complete!</h1>

            <p>
              You scored {score} out of {triviaQuestions?.length ?? 0}.
            </p>

            <button
              type="button"
              className="trivia-button"
              onClick={restartQuiz}
            >
              Try Again
            </button>
          </div>
        </PageLayout>
      )
    }

    const question = triviaQuestions![currentQuestion]

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
          <h1>{resource.title}</h1>

          <p>{resource.description}</p>

          <p>
            Question {currentQuestion + 1} of {triviaQuestions?.length ?? 0}
          </p>

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
                  {currentQuestion === triviaQuestions.length - 1
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

  return (
    <PageLayout className="resource-details-page" width="wide">
      <Link to="/resources" className="resource-back-link">
        <FiArrowLeft aria-hidden="true" />
        Back to Educational Resources
      </Link>

      <div className="resource-details-card">
        <h1>{resource.title}</h1>

        <p>{resource.description}</p>

        {(resource.sections ?? []).map((section) => (
          <section
            className={`resource-section ${section.styleType}`}
            key={`${section.heading}-${section.styleType}`}
          >
            <h2>{section.heading}</h2>

            <ul>
              {section.items.split('|').map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}

export default ResourceDetails