import assert from 'node:assert/strict'
import { describeSessionEvent, sessionMatchesRound } from '../lib/sessionEventGuard.ts'

function check(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`fail - ${name}`)
    throw error
  }
}

check('accepts British GP for great-britain', () => {
  assert.equal(
    sessionMatchesRound(
      { meta: { event: { name: 'British Grand Prix', officialName: 'FORMULA 1 PIRELLI BRITISH GRAND PRIX 2026' } } },
      { id: 'great-britain', name: 'British Grand Prix', location: 'Silverstone' }
    ),
    true
  )
})

check('rejects Austrian GP under great-britain slug', () => {
  assert.equal(
    sessionMatchesRound(
      { meta: { event: { name: 'Austrian Grand Prix', officialName: 'FORMULA 1 LENOVO AUSTRIAN GRAND PRIX 2026' } } },
      { id: 'great-britain', name: 'British Grand Prix', location: 'Silverstone' }
    ),
    false
  )
})

check('does not confuse austria with australian', () => {
  assert.equal(
    sessionMatchesRound(
      { meta: { event: { name: 'Australian Grand Prix' } } },
      { id: 'austria', name: 'Austrian Grand Prix', location: 'Spielberg' }
    ),
    false
  )
  assert.equal(
    sessionMatchesRound(
      { meta: { event: { name: 'Austrian Grand Prix' } } },
      { id: 'austria', name: 'Austrian Grand Prix', location: 'Spielberg' }
    ),
    true
  )
})

check('describeSessionEvent prefers event name', () => {
  assert.equal(
    describeSessionEvent({ meta: { event: { name: 'British Grand Prix', officialName: 'OFFICIAL' } } }),
    'British Grand Prix'
  )
})

console.log('All sessionEventGuard checks passed')
