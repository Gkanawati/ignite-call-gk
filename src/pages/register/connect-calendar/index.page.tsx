import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import { ArrowRight } from 'phosphor-react'
import { ConnectBox, ConnectItem } from './styles'
import { signIn, useSession } from 'next-auth/react'

export default function ConnectCalendar() {
  const session = useSession()

  // async function handleRegister(data: RegisterFormData) {
  // }

  return (
    <Container>
      <Header>
        <Heading as="strong">Conecte sua agenda!</Heading>
        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={2} />

        <ConnectBox>
          <ConnectItem>
            <Text>Google Agenda</Text>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => signIn('google')}
            >
              Conectar
              <ArrowRight />
            </Button>
          </ConnectItem>

          <Button type="submit" disabled={false}>
            Próximo passo
            <ArrowRight />
          </Button>
        </ConnectBox>
      </Header>
    </Container>
  )
}
