import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'

export function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                Assistência técnica moderna
              </p>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">
                Conserto profissional de celulares, notebooks e eletrônicos.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Troca de tela, bateria, reparos avançados, manutenção de notebooks e acompanhamento online da sua ordem de serviço.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg">Solicitar atendimento</Button>
                <Button size="lg" variant="secondary">
                  Acompanhar serviço
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="rounded-3xl bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Status da OS</p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  OS-2026-0001
                </h2>

                <div className="mt-6 space-y-3">
                  {['Recebido', 'Diagnóstico', 'Orçamento', 'Aguardando aprovação'].map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
                          {index + 1}
                        </div>
                        <span className="text-sm text-slate-200">{item}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

    <section className="py-16">
      <Container>
        <SectionHeader
          align="center"
          eyebrow="Serviços"
          title="Especialistas em conserto e manutenção"
          description="Atendimento técnico especializado para celulares, notebooks, computadores, tablets e eletrônicos."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">
              Conserto de celulares
            </h3>

            <p className="mt-3 text-slate-300">
              Troca de tela, bateria, conector, câmera, software e reparos avançados.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">
              Manutenção de notebooks
            </h3>

            <p className="mt-3 text-slate-300">
              Formatação, upgrade, limpeza, troca de peças e reparo de placa.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-white">
              Atendimento transparente
            </h3>

            <p className="mt-3 text-slate-300">
              Acompanhe sua ordem de serviço online e aprove orçamentos pelo site.
            </p>
          </Card>
        </div>
      </Container>
    </section>
    </main>
  )
}
