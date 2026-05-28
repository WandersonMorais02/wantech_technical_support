import { Container } from '../components/Container'
import { SectionHeader } from '../components/SectionHeader'

export function AiChatPage() {
  return (
    <Container className="py-20">
      <SectionHeader
        eyebrow="Chat IA"
        title="Atendimento inteligente"
        description="Aqui ficará o chat de atendimento com IA e suporte ao cliente."
      />
    </Container>
  )
}
