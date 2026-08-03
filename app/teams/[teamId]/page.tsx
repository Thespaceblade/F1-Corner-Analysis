import TeamDetailPage from '../../../components/TeamDetailPage'

type TeamDetailRouteProps = {
  params: { teamId: string }
}

export default function TeamDetailRoutePage({ params }: TeamDetailRouteProps) {
  return <TeamDetailPage teamId={params.teamId} />
}
