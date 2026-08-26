var mockExtractReceiptDraft = jest.fn()

jest.mock('../../../../lib/receipt-extract', () => ({
  extractReceiptDraftFromBase64: (...args: unknown[]) =>
    mockExtractReceiptDraft(...args),
}))

import { extractExpenseInformationFromImage } from './create-from-receipt-button-actions'

const GROUP_ID = 'group-test'
const LOG_ID = 'test-log-id'
const IMAGE_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k='

const NOTHING_EXTRACTED = {
  amount: null,
  categoryId: null,
  date: null,
  title: null,
  draft: null,
  logId: LOG_ID,
  error: 'Could not read anything from this receipt.',
}

describe('extractExpenseInformationFromImage', () => {
  beforeEach(() => mockExtractReceiptDraft.mockReset())

  it('returns every field the model read off the receipt', async () => {
    mockExtractReceiptDraft.mockResolvedValue({
      draft: {
        title: 'Dinner',
        amount: 4250,
        expenseDate: '2026-03-01',
        paidByParticipantId: 'p1',
        paidFor: [{ participantId: 'p1', shares: 4250 }],
        splitMode: 'BY_AMOUNT',
        lineItems: [],
      },
      raw: {},
      logId: LOG_ID,
    })

    expect(
      await extractExpenseInformationFromImage(GROUP_ID, IMAGE_DATA_URL),
    ).toEqual({
      amount: 42.5,
      categoryId: null,
      date: '2026-03-01',
      title: 'Dinner',
      draft: expect.objectContaining({ title: 'Dinner' }),
      logId: LOG_ID,
    })
  })

  it('keeps a title containing a comma intact', async () => {
    mockExtractReceiptDraft.mockResolvedValue({
      draft: {
        title: 'Dinner, drinks and tip',
        amount: 4250,
        expenseDate: '2026-03-01',
        paidByParticipantId: 'p1',
        paidFor: [{ participantId: 'p1', shares: 4250 }],
        splitMode: 'BY_AMOUNT',
        lineItems: [],
      },
      raw: {},
      logId: LOG_ID,
    })

    const info = await extractExpenseInformationFromImage(
      GROUP_ID,
      IMAGE_DATA_URL,
    )
    expect(info.title).toBe('Dinner, drinks and tip')
    expect(info.amount).toBe(42.5)
  })

  it('passes group id and image data to receipt extraction', async () => {
    mockExtractReceiptDraft.mockResolvedValue({
      draft: {
        title: 'x',
        amount: 100,
        expenseDate: '2026-03-01',
        paidByParticipantId: 'p1',
        paidFor: [{ participantId: 'p1', shares: 100 }],
        splitMode: 'BY_AMOUNT',
        lineItems: [],
      },
      raw: {},
      logId: LOG_ID,
    })

    await extractExpenseInformationFromImage(GROUP_ID, IMAGE_DATA_URL, 'p2')

    expect(mockExtractReceiptDraft).toHaveBeenCalledWith(
      GROUP_ID,
      IMAGE_DATA_URL,
      'p2',
      expect.any(String),
    )
  })

  it('reports nothing extracted when extraction returns null draft', async () => {
    mockExtractReceiptDraft.mockResolvedValue({ draft: null, logId: LOG_ID })
    expect(
      await extractExpenseInformationFromImage(GROUP_ID, IMAGE_DATA_URL),
    ).toEqual(NOTHING_EXTRACTED)
  })

  it('propagates errors from receipt extraction', async () => {
    mockExtractReceiptDraft.mockRejectedValue(new Error('Invalid image data.'))
    await expect(
      extractExpenseInformationFromImage(GROUP_ID, 'not-a-data-url'),
    ).rejects.toThrow('Invalid image data.')
  })
})
