import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BrainCircuit, Plus } from 'lucide-react'

import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import {
  listBotIntents,
  listBotTokens,
  saveBotIntent,
  saveBotToken,
  listBotAnswers,
  saveBotAnswer,
  listBotTrainings,
  approveBotTraining,
} from '../../services/botTrainingService'


export function IATrainingPage() {
  const [tab, setTab] = useState('intents')
  const queryClient = useQueryClient()

const [intentForm, setIntentForm] = useState({
  name: '',
  description: '',
  confidenceThreshold: 0.3,
})

const { data: intentsData, isLoading: isLoadingIntents } = useQuery({
  queryKey: ['bot-intents'],
  queryFn: listBotIntents,
})

const intents = intentsData?.data || intentsData?.items || intentsData || []

const intentMutation = useMutation({
  mutationFn: saveBotIntent,
  onSuccess: () => {
    setIntentForm({
      name: '',
      description: '',
      confidenceThreshold: 0.3,
    })

    queryClient.invalidateQueries({ queryKey: ['bot-intents'] })
  },
})

const [tokenForm, setTokenForm] = useState({
  token: '',
  intentId: '',
  weight: 1,
})

const { data: tokensData, isLoading: isLoadingTokens } = useQuery({
  queryKey: ['bot-tokens'],
  queryFn: listBotTokens,
})

const tokens = tokensData?.data || tokensData?.items || tokensData || []

const tokenMutation = useMutation({
  mutationFn: saveBotToken,
  onSuccess: () => {
    setTokenForm({
      token: '',
      intentId: '',
      weight: 1,
    })

    queryClient.invalidateQueries({ queryKey: ['bot-tokens'] })
  },
})

const [answerForm, setAnswerForm] = useState({
  intentId: '',
  content: '',
  priority: 1,
})

const { data: answersData, isLoading: isLoadingAnswers } = useQuery({
  queryKey: ['bot-answers'],
  queryFn: listBotAnswers,
})

const answers = answersData?.data || answersData?.items || answersData || []

const answerMutation = useMutation({
  mutationFn: saveBotAnswer,
  onSuccess: () => {
    setAnswerForm({
      intentId: '',
      content: '',
      priority: 1,
    })

    queryClient.invalidateQueries({ queryKey: ['bot-answers'] })
  },
})

function handleCreateAnswer(event) {
  event.preventDefault()

  if (!answerForm.intentId || !answerForm.content.trim()) return

  answerMutation.mutate({
    intentId: answerForm.intentId,
    content: answerForm.content.trim(),
    priority: Number(answerForm.priority || 1),
  })
}

const { data: trainingsData, isLoading: isLoadingTrainings } = useQuery({
  queryKey: ['bot-trainings'],
  queryFn: listBotTrainings,
})

const trainings =
  trainingsData?.data ||
  trainingsData?.items ||
  trainingsData ||
  []

const approveTrainingMutation = useMutation({
  mutationFn: ({ id, data }) => approveBotTraining(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['bot-trainings'] })
  },
})

function handleApproveTraining(training) {
  const id = training.id || training._id

  approveTrainingMutation.mutate({
    id,
    data: {
      finalResponse:
        training.finalResponse ||
        training.suggestedResponse ||
        training.response ||
        '',
      intentIds:
        training.intentIds ||
        training.intents?.map((intent) => intent.id || intent._id) ||
        [],
    },
  })
}

function handleCreateToken(event) {
  event.preventDefault()

  if (!tokenForm.token.trim() || !tokenForm.intentId) return

  tokenMutation.mutate({
    token: tokenForm.token.trim().toLowerCase(),
    intentId: tokenForm.intentId,
    weight: Number(tokenForm.weight || 1),
  })
}

function handleCreateIntent(event) {
  event.preventDefault()

  if (!intentForm.name.trim()) return

  intentMutation.mutate({
    name: intentForm.name.trim().toUpperCase().replace(/\s+/g, '_'),
    description: intentForm.description.trim() || undefined,
    confidenceThreshold: Number(intentForm.confidenceThreshold || 0.3),
  })
}

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Inteligência Artificial
        </p>

        <h2 className="mt-2 text-3xl font-black">
          Treinamento da IA
        </h2>

        <p className="mt-2 text-slate-400">
          Configure intenções, tokens, respostas e aprove aprendizados.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['intents', 'Intenções'],
          ['tokens', 'Tokens'],
          ['answers', 'Respostas'],
          ['relations', 'Relações'],
          ['trainings', 'Treinamentos'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={
              tab === value
                ? 'rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950'
                : 'rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/15'
            }
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {tab === 'intents' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateIntent} className="grid gap-4 md:grid-cols-[1fr_1fr_160px_auto]">
              <Input
                placeholder="Nome da intenção. Ex: WATER_DAMAGE"
                value={intentForm.name}
                onChange={(event) =>
                  setIntentForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />

              <Input
                placeholder="Descrição"
                value={intentForm.description}
                onChange={(event) =>
                  setIntentForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />

              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={intentForm.confidenceThreshold}
                onChange={(event) =>
                  setIntentForm((current) => ({
                    ...current,
                    confidenceThreshold: event.target.value,
                  }))
                }
              />

              <Button type="submit" disabled={intentMutation.isPending}>
                <Plus size={18} />
                Criar
              </Button>
            </form>

            {isLoadingIntents && (
              <p className="text-sm text-slate-500">Carregando intenções...</p>
            )}

            <div className="grid gap-3">
              {intents.map((intent) => (
                <div
                  key={intent.id || intent._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <strong className="block text-white">
                    {intent.name}
                  </strong>

                  <p className="mt-1 text-sm text-slate-400">
                    {intent.description || 'Sem descrição'}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Confiança mínima: {intent.confidenceThreshold ?? 0.3}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!['intents', 'tokens', 'answers', 'trainings'].includes(tab) && (
          <div className="flex items-center gap-3 text-slate-300">
            <BrainCircuit className="text-cyan-300" />
            <span>
              Aba atual: <strong>{tab}</strong>
            </span>
          </div>
        )}

        {tab === 'tokens' && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateToken}
              className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto]"
            >
              <Input
                placeholder="Token. Ex: molhou"
                value={tokenForm.token}
                onChange={(event) =>
                  setTokenForm((current) => ({
                    ...current,
                    token: event.target.value,
                  }))
                }
              />

              <select
                value={tokenForm.intentId}
                onChange={(event) =>
                  setTokenForm((current) => ({
                    ...current,
                    intentId: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
              >
                <option value="">Selecione a intenção</option>

                {intents.map((intent) => (
                  <option key={intent.id || intent._id} value={intent.id || intent._id}>
                    {intent.name}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                step="0.1"
                min="0"
                value={tokenForm.weight}
                onChange={(event) =>
                  setTokenForm((current) => ({
                    ...current,
                    weight: event.target.value,
                  }))
                }
              />

              <Button type="submit" disabled={tokenMutation.isPending}>
                <Plus size={18} />
                Criar
              </Button>
            </form>

            {isLoadingTokens && (
              <p className="text-sm text-slate-500">Carregando tokens...</p>
            )}

            <div className="grid gap-3">
              {tokens.map((item) => (
                <div
                  key={item.id || item._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <strong className="block text-white">{item.token}</strong>

                  <p className="mt-1 text-sm text-slate-400">
                    Intenção:{' '}
                    {item.intent?.name ||
                      item.intentId?.name ||
                      item.intent ||
                      item.intentId ||
                      '-'}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Peso: {item.weight ?? 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'answers' && (
          <div className="space-y-6">
            <form
              onSubmit={handleCreateAnswer}
              className="space-y-4"
            >
              <select
                value={answerForm.intentId}
                onChange={(event) =>
                  setAnswerForm((current) => ({
                    ...current,
                    intentId: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none"
              >
                <option value="">
                  Selecione uma intenção
                </option>

                {intents.map((intent) => (
                  <option
                    key={intent.id || intent._id}
                    value={intent.id || intent._id}
                  >
                    {intent.name}
                  </option>
                ))}
              </select>

              <textarea
                value={answerForm.content}
                onChange={(event) =>
                  setAnswerForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                placeholder="Resposta da IA"
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none"
              />

              <div className="grid gap-4 md:grid-cols-[160px_auto]">
                <Input
                  type="number"
                  min="1"
                  value={answerForm.priority}
                  onChange={(event) =>
                    setAnswerForm((current) => ({
                      ...current,
                      priority: event.target.value,
                    }))
                  }
                />

                <Button
                  type="submit"
                  disabled={answerMutation.isPending}
                >
                  <Plus size={18} />
                  Criar resposta
                </Button>
              </div>
            </form>

            {isLoadingAnswers && (
              <p className="text-sm text-slate-500">
                Carregando respostas...
              </p>
            )}

            <div className="grid gap-3">
              {answers.map((answer) => (
                <div
                  key={answer.id || answer._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <strong className="block text-white">
                    {answer.intent?.name ||
                      answer.intentId?.name ||
                      answer.intent ||
                      answer.intentId ||
                      '-'}
                  </strong>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                    {answer.content}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    Prioridade: {answer.priority ?? 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'trainings' && (
          <div className="space-y-4">
            {isLoadingTrainings && (
              <p className="text-sm text-slate-500">
                Carregando treinamentos...
              </p>
            )}

            {!isLoadingTrainings && trainings.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum treinamento pendente.
              </p>
            )}

            <div className="grid gap-3">
              {trainings.map((training) => (
                <div
                  key={training.id || training._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <strong className="block text-white">
                    {training.message ||
                      training.question ||
                      training.input ||
                      'Pergunta não informada'}
                  </strong>

                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                    {training.finalResponse ||
                      training.suggestedResponse ||
                      training.response ||
                      'Sem resposta sugerida'}
                  </p>

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      disabled={approveTrainingMutation.isPending}
                      onClick={() => handleApproveTraining(training)}
                    >
                      Aprovar treinamento
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
