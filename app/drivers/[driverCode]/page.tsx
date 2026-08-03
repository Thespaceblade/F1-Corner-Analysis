import DriverDetailPage from '../../../components/DriverDetailPage'

type DriverDetailRouteProps = {
  params: { driverCode: string }
}

export default function DriverDetailRoutePage({ params }: DriverDetailRouteProps) {
  return <DriverDetailPage driverCode={params.driverCode} />
}
