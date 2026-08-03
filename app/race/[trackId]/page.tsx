import ClientPage from '../../../components/ClientPage'

type RaceTrackPageProps = {
  params: {
    trackId: string
  }
}

export default function RaceTrackPage({ params }: RaceTrackPageProps) {
  return <ClientPage trackId={params.trackId} />
}
