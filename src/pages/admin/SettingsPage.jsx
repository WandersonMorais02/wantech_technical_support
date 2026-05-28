import { Card } from '../../components/Card'

export function SettingsPage() {
  return (
    <div>
      <h2 className="text-3xl font-black">Configurações</h2>
      <p className="mt-2 text-slate-400">
        Dados da empresa, horários, contatos e preferências do sistema.
      </p>

      <Card className="mt-6 p-6">
        <p className="text-slate-300">Configurações gerais da assistência.</p>
      </Card>
    </div>
  )
}
