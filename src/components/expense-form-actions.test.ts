// `var` and the indirection through an arrow are both deliberate: jest hoists
// this mock above the file's own initialisation.
var mockNemotronChat = jest.fn()

jest.mock('../lib/nemotron', () => ({
  nemotronChat: (...args: unknown[]) => mockNemotronChat(...args),
  // The real implementation is pure, so it is reused rather than stubbed: the
  // tests below depend on its markdown-fence and validation behaviour.
  parseModelJson: jest.requireActual('../lib/nemotron').parseModelJson,
}))
jest.mock('../lib/featureFlags', () => ({
  getRuntimeFeatureFlags: async () => ({ enableCategoryExtract: true }),
}))
jest.mock('../lib/api', () => ({
  getCategories: async () => [
    { id: 0, grouping: 'General', name: 'General' },
    { id: 4, grouping: 'Transport', name: 'Taxi' },
  ],
}))

import { extractCategoryFromTitle } from './expense-form-actions'

function respondWith(content: string) {
  mockNemotronChat.mockResolvedValue(content)
}

describe('extractCategoryFromTitle', () => {
  beforeEach(() => mockNemotronChat.mockReset())

  it('returns the category the model picked', async () => {
    respondWith(JSON.stringify({ categoryId: 4 }))
    expect(await extractCategoryFromTitle('Taxi to the airport')).toEqual({
      categoryId: 4,
    })
  })

  it('asks Nemotron for the id without spending a reasoning budget', async () => {
    respondWith(JSON.stringify({ categoryId: 4 }))
    await extractCategoryFromTitle('Taxi to the airport')

    const request = mockNemotronChat.mock.calls[0][0]
    // Deterministic, and cheap: one small integer comes back.
    expect(request.temperature).toBe(0)
    expect(request.reasoningBudget).toBe(0)
    expect(request.maxTokens).toBe(512)
    // The shape has to be requested in the prompt; Nemotron has no
    // structured-output mode to bind it.
    expect(request.messages[0].content).toContain('"categoryId"')
  })

  it('truncates the title before sending it', async () => {
    respondWith(JSON.stringify({ categoryId: 4 }))
    await extractCategoryFromTitle('T'.repeat(100))

    const userMessage = mockNemotronChat.mock.calls[0][0].messages.at(-1)
    expect(userMessage.content).toHaveLength(40)
  })

  it('accepts an id returned inside a markdown fence', async () => {
    respondWith('```json\n{"categoryId": 4}\n```')
    expect(await extractCategoryFromTitle('Taxi to the airport')).toEqual({
      categoryId: 4,
    })
  })

  // Everything below must degrade to the "General" fallback rather than throw:
  // a reasoning model may ignore the requested shape entirely.
  it.each([
    ['an id that does not exist', JSON.stringify({ categoryId: 9999 })],
    ['a value of the wrong type', JSON.stringify({ categoryId: 'four' })],
    ['a missing field', JSON.stringify({})],
    ['a response that is not JSON', 'Transport'],
    ['an empty response', ''],
  ])('falls back to the first category for %s', async (_name, content) => {
    respondWith(content)
    expect(await extractCategoryFromTitle('Taxi to the airport')).toEqual({
      categoryId: 0,
    })
  })

  it('falls back to the first category when the call itself fails', async () => {
    mockNemotronChat.mockRejectedValue(
      new Error('NVIDIA_API_KEY is not configured.'),
    )
    expect(await extractCategoryFromTitle('Taxi to the airport')).toEqual({
      categoryId: 0,
    })
  })
})
