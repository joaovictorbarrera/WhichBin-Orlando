import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft,
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiList,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
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

function getPdfPath(title: string) {
  const pdfPaths: Record<string, string> = {
    'Recycling Basics': '/pdfs/recycling-basics.pdf',
    'How to Prepare Items': '/pdfs/how-to-prepare-items.pdf',
    'Common Mistakes': '/pdfs/common-mistakes.pdf',
    'Orlando Recycling Guide': '/pdfs/orlando-recycling-guide.pdf',
  }

  return pdfPaths[title] ?? null
}

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

  function getSectionIcon(styleType: string) {
    if (styleType.includes('blue')) {
      return <FiInfo aria-hidden="true" />
    }

    if (styleType.includes('orange')) {
      return <FiAlertTriangle aria-hidden="true" />
    }

    if (styleType.includes('red')) {
      return <FiXCircle aria-hidden="true" />
    }

    return <FiCheckCircle aria-hidden="true" />
  }

  function getSectionClass(styleType: string) {
    if (styleType.includes('blue')) {
      return 'resource-section resource-section-blue'
    }

    if (styleType.includes('orange')) {
      return 'resource-section resource-section-orange'
    }

    if (styleType.includes('red')) {
      return 'resource-section resource-section-red'
    }

    return 'resource-section resource-section-green'
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
          <div className="resource-empty-icon">
            <FiInfo aria-hidden="true" />
          </div>

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
            <div className="resource-hero resource-hero-green">
              <div className="resource-hero-icon">
                <FaRecycle aria-hidden="true" />
              </div>

              <div>
                <p className="resource-hero-label">Interactive Challenge</p>
                <h1>{resource.title}</h1>
                <p>{resource.description}</p>
              </div>
            </div>

            <div className="resource-loading-message">
              Loading challenge questions...
            </div>
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
            <div className="resource-hero resource-hero-green">
              <div className="resource-hero-icon">
                <FaRecycle aria-hidden="true" />
              </div>

              <div>
                <p className="resource-hero-label">Interactive Challenge</p>
                <h1>{resource.title}</h1>
                <p>{resource.description}</p>
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

              <p className="resource-hero-label">Challenge Complete</p>

              <h1>Great Job!</h1>

              <p>
                You scored {score} out of {triviaQuestions.length}.
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

    const question = triviaQuestions[currentQuestion]

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
              <p className="resource-hero-label">Interactive Challenge</p>
              <h1>{resource.title}</h1>
              <p>{resource.description}</p>
            </div>
          </div>

          <div className="trivia-progress">
            <span>
              Question {currentQuestion + 1} of {triviaQuestions.length}
            </span>

            <div className="trivia-progress-bar">
              <div
                className="trivia-progress-fill"
                style={{
                  width: `${
                    ((currentQuestion + 1) / triviaQuestions.length) * 100
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
        <div className="resource-hero resource-hero-green">
          <div className="resource-hero-icon">
            <FaRecycle aria-hidden="true" />
          </div>

          <div>
            <p className="resource-hero-label">Educational Resource</p>

            <h1>{resource.title}</h1>

            <p>{resource.description}</p>
          </div>
        </div>

        <div className="resource-section-list">
          {(resource.sections ?? []).map((section, sectionIndex) => (
            <section
              className={getSectionClass(section.styleType)}
              key={`${section.heading}-${sectionIndex}`}
            >
              <div className="resource-section-heading">
                <div className="resource-section-icon">
                  {getSectionIcon(section.styleType)}
                </div>

                <div>
                  <h2>{section.heading}</h2>
                </div>
              </div>

              <ul>
                {section.items.split('|').map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {(resource.sections ?? []).length === 0 && (
          <div className="resource-empty-message">
            <FiList aria-hidden="true" />
            <p>No information has been added to this resource yet.</p>
          </div>
        )}

        {getPdfPath(resource.title) && (
           <section className="resource-pdf">
           <div className="resource-pdf-header">
           <div>
             <span className="resource-pdf-label">PDF GUIDE</span>
        <h2>Additional Information</h2>
        <p>View the complete guide for this resource.</p>
      </div>

      <a
        href={getPdfPath(resource.title) ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="resource-pdf-button"
              >
                  Open PDF
            </a>
          </div>
        </section>
        )}
      </div>
    </PageLayout>
  )
}



export default ResourceDetails