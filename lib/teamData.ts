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
    color: '#000B8D',
    drivers: [
      { code: 'VER', name: 'Max Verstappen', number: 1 },
      { code: 'TSU', name: 'Yuki Tsunoda', number: 22 }
    ]
  },
   {
    id: 'mclaren',
    name: 'McLaren Formula 1 Team',
    shortName: 'McLaren',
    color: '#FF8000',
    drivers: [
      { code: 'NOR', name: 'Lando Norris', number: 4 },
      { code: 'PIA', name: 'Oscar Piastri', number: 81 }
    ]
  },
  {
    id: 'mercedes',
    name: 'Mercedes-AMG PETRONAS F1 Team',
    shortName: 'Mercedes',
    color: '#00A19B',
    drivers: [
        { code: 'RUS', name: 'George Russell', number: 63 },
        { code: 'ANT', name: 'Kimi Antonelli', number: 12 }
    ]
  },
  {
    id: 'ferrari',
    name: 'Scuderia Ferrari',
    shortName: 'Ferrari',
    color: '#ED1131',
    drivers: [
      { code: 'LEC', name: 'Charles Leclerc', number: 16 },
      { code: 'HAM', name: 'Lewis Hamilton', number: 44 }
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
      { code: 'COL', name: 'Franco Colapinto', number: 43 },
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
      { code: 'SAI', name: 'Carlos Sainz', number: 55 }    
    ]
  },

  {
    id: 'visa-rb',
    name: 'Visa Cash App RB Formula One Team',
    shortName: 'RB',
    color: '#5E8FAA',
    drivers: [
      { code: 'LAW', name: 'Liam Lawson', number: 30 },
      { code: 'HAD', name: 'Isack Hadjar', number: 6 }
    ]
  },
  {
    id: 'stake',
    name: 'Stake F1 Team Kick Sauber',
    shortName: 'Stake',
    color: '#52E252',
    drivers: [
      { code: 'HUL', name: 'Nico Hulkenburg', number: 27 },
      { code: 'BOR', name: 'Gabriel Bortoleto', number: 5 }
    ]
  },
  {
    id: 'haas',
    name: 'MoneyGram Haas F1 Team',
    shortName: 'Haas',
    color: '#B6BABD',
    drivers: [
      { code: 'OCO', name: 'Esteban Ocon', number: 31 },
      { code: 'BEA', name: 'Oliver Bearman', number: 87 }
    ]
  }
];