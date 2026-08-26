import { parseJsonFromModelOutput, parseModelJson } from '@/lib/nemotron'
import { z } from 'zod'

describe('nemotron JSON parsing', () => {
  it('parses raw JSON', () => {
    expect(parseJsonFromModelOutput('{"a":1}')).toEqual({ a: 1 })
  })

  it('parses fenced JSON', () => {
    expect(parseJsonFromModelOutput('```json\n{"b":2}\n```')).toEqual({ b: 2 })
  })

  it('parses JSON after reasoning tags', () => {
    expect(
      parseJsonFromModelOutput(
        '</think>\n{"title":"COFFEE SHOP","total":13.75}',
      ),
    ).toEqual({ title: 'COFFEE SHOP', total: 13.75 })
  })

  it('validates with Zod schema', () => {
    const schema = z.object({ title: z.string(), amount: z.number() })
    const result = parseModelJson('{"title":"Lunch","amount":1850}', schema)
    expect(result).toEqual({ title: 'Lunch', amount: 1850 })
  })
})
