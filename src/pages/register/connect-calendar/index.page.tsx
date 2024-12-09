import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import { ArrowRight, Check } from 'phosphor-react'
import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import { AuthError, ConnectBox, ConnectItem } from './styles'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()

  const hasAuthError = router.query.error === 'permissions'
  const isSignedIn = session.status === 'authenticated'

  async function handleConnectCalendar() {
    await signIn('google')
  }

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
            {isSignedIn ? (
              <Button size="sm" disabled>
                Conectado
                <Check />
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleConnectCalendar}
              >
                Conectar
                <ArrowRight />
              </Button>
            )}
          </ConnectItem>

          {hasAuthError && (
            <AuthError>
              Falha ao se conectar com o Google, verifique se você habilitou as
              permissões de acesso ao Google Agenda.
            </AuthError>
          )}

          <Button type="submit" disabled={!isSignedIn}>
            Próximo passo
            <ArrowRight />
          </Button>
        </ConnectBox>
      </Header>
    </Container>
  )
}
