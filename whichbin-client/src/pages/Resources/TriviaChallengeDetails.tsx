import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
} from 'react-icons/fi'
import { FaRecycle } from 'react-icons/fa6'
import DetailStatus, {
  type DetailStatusType,
} from '../../components/DetailStatus'
import {
  getTriviaChallengeById,
  type TriviaChallenge,
} from '../../services/triviaService'
import { isNotFoundError } from '../../helpers/ErrorHelper'
import PageLayout from '../../components/PageLayout'
import './ResourceDetails.css'

type ChallengeDetailState = DetailStatusType | 'success'

type ChallengeDetailViewState = {
  challengeId: string | undefined
  status: ChallengeDetailState
  challenge: TriviaChallenge | null
}

function TriviaChallengeDetails() {
  const { challengeId } = useParams()
  const navigate = useNavigate()

  const [detailState, setDetailState] = useState<ChallengeDetailViewState>({
    challengeId,
    status: challengeId ? 'loading' : 'failed',
    challenge: null,
  })
  const [retryCount, setRetryCount] = useState(0)
  const parsedChallengeId = Number(challengeId)
  const challengeIdIsValid =
    Number.isInteger(parsedChallengeId) && parsedChallengeId > 0
  const status =
    !challengeId || !challengeIdIsValid
      ? 'failed'
      : detailState.challengeId === challengeId
        ? detailState.status
        : 'loading'
  const challenge =
    detailState.challengeId === challengeId ? detailState.challenge : null

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  useEffect(() => {
    if (!challengeId || !challengeIdIsValid) {
      return
    }

    let isMounted = true

    getTriviaChallengeById(parsedChallengeId)
      .then((data) => {
        if (isMounted) {
          setDetailState({
            challengeId,
            status: 'success',
            challenge: data,
          })
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setDetailState({
            challengeId,
            status: isNotFoundError(error) ? 'not-found' : 'failed',
            challenge: null,
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [challengeId, challengeIdIsValid, parsedChallengeId, retryCount])

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

  if (status !== 'success' || !challenge) {
    return (
      <PageLayout className="resource-details-page" width="wide">
        <Link to="/resources" className="resource-back-link">
          <FiArrowLeft aria-hidden="true" />
          Back to Educational Resources
        </Link>

        <DetailStatus
          featureName="challenge"
          status={status === 'success' ? 'failed' : status}
          onRetry={() => {
            if (challengeId && challengeIdIsValid) {
              setDetailState({
                challengeId,
                status: 'loading',
                challenge: null,
              })
            }
            setRetryCount((count) => count + 1)
          }}
        />
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
    const totalQuestions = challenge.questions.length
    const perfectScore = score === totalQuestions
    const scoreAboveHalf = score > totalQuestions / 2

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

            <h1>
              {perfectScore
                ? 'Perfect Score!'
                : scoreAboveHalf
                  ? 'Great Job!'
                  : 'Not quite...'}
            </h1>

            <p>
              You scored {score} out of {totalQuestions}.
            </p>

            {perfectScore ? (
              <>
                <p>
                  You answered every question correctly! Keep up
                  the great work and put your recycling knowledge
                  to use.
                </p>

                <button
                  type="button"
                  className="trivia-button"
                  onClick={() => navigate('/resources')}
                >
                  Return to Resources
                </button>
              </>
            ) : (
              <>
                <p>
                  {scoreAboveHalf
                    ? 'Nice work! You are learning how to recycle correctly. Try again to see if you can get a perfect score.'
                    : 'Not quite there yet. Review the educational resources and try the challenge again to improve your score.'}
                </p>

                <button
                  type="button"
                  className="trivia-button"
                  onClick={restartQuiz}
                >
                  Try Again
                </button>
              </>
            )}
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