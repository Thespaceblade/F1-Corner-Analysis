export interface Driver {
  code: string
  name: string
  number: number
}

export interface Team {
  id: string
  name: string
  shortName: string
  color: string
  drivers: [Driver, Driver]
}

export const f1Teams: Team[] = [
  {
    id: 'red-bull',
    name: 'Oracle Red Bull Racing',
    shortName: 'Red Bull',
    color: '#3671C6',
    drivers: [
      { code: 'VER', name: 'Max Verstappen', number: 1 },
      { code: 'PER', name: 'Sergio Perez', number: 11 }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-AMG PETRONAS F1 Team',
    shortName: 'Mercedes',
    color: '#6CD3BF',
    drivers: [
      { code: 'HAM', name: 'Lewis Hamilton', number: 44 },
      { code: 'RUS', name: 'George Russell', number: 63 }
    ]
  },
  {
    id: 'ferrari',
    name: 'Scuderia Ferrari',
    shortName: 'Ferrari',
    color: '#F91536',
    drivers: [
      { code: 'LEC', name: 'Charles Leclerc', number: 16 },
      { code: 'SAI', name: 'Carlos Sainz', number: 55 }
    ]
  },
  {
    id: 'mclaren',
    name: 'McLaren Formula 1 Team',
    shortName: 'McLaren',
    color: '#F58020',
    drivers: [
      { code: 'NOR', name: 'Lando Norris', number: 4 },
      { code: 'PIA', name: 'Oscar Piastri', number: 81 }
    ]
  },
  {
    id: 'aston-martin',
    name: 'Aston Martin Aramco Formula One Team',
    shortName: 'Aston Martin',
    color: '#358C75',
    drivers: [
      { code: 'ALO', name: 'Fernando Alonso', number: 14 },
      { code: 'STR', name: 'Lance Stroll', number: 18 }
    ]
  },
  {
    id: 'alpine',
    name: 'BWT Alpine F1 Team',
    shortName: 'Alpine',
    color: '#2293D1',
    drivers: [
      { code: 'OCO', name: 'Esteban Ocon', number: 31 },
      { code: 'GAS', name: 'Pierre Gasly', number: 10 }
    ]
  },
  {
    id: 'williams',
    name: 'Williams Racing',
    shortName: 'Williams',
    color: '#37BEDD',
    drivers: [
      { code: 'ALB', name: 'Alexander Albon', number: 23 },
      { code: 'SAR', name: 'Logan Sargeant', number: 2 }
    ]
  },
  {
    id: 'visa-rb',
    name: 'Visa Cash App RB Formula One Team',
    shortName: 'RB',
    color: '#5E8FAA',
    drivers: [
      { code: 'RIC', name: 'Daniel Ricciardo', number: 3 },
      { code: 'TSU', name: 'Yuki Tsunoda', number: 22 }
    ]
  },
  {
    id: 'stake',
    name: 'Stake F1 Team Kick Sauber',
    shortName: 'Stake',
    color: '#52E252',
    drivers: [
      { code: 'BOT', name: 'Valtteri Bottas', number: 77 },
      { code: 'ZHO', name: 'Zhou Guanyu', number: 24 }
    ]
  },
  {
    id: 'haas',
    name: 'MoneyGram Haas F1 Team',
    shortName: 'Haas',
    color: '#B6BABD',
    drivers: [
      { code: 'MAG', name: 'Kevin Magnussen', number: 20 },
      { code: 'HUL', name: 'Nico Hulkenberg', number: 27 }
    ]
  }
];