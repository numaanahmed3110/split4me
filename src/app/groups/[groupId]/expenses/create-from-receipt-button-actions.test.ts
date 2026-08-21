var mockExtractReceiptDraft = jest.fn()

jest.mock('../../../../lib/receipt-extract', () => ({
  extractReceiptDraft: (...args: unknown[]) => mockExtractReceiptDraft(...args),
}))

import { extractExpenseInformationFromImage } from './create-from-receipt-button-actions'

const GROUP_ID = 'group-test'
const IMAGE = 'https://uploads.test/receipt.jpg'

const NOTHING_EXTRACTED = {
  amount: null,
  categoryId: null,
  date: null,
  title: null,
  draft: null,
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
    })

    expect(await extractExpenseInformationFromImage(GROUP_ID, IMAGE)).toEqual({
      amount: 42.5,
      categoryId: null,
      date: '2026-03-01',
      title: 'Dinner',
      draft: expect.objectContaining({ title: 'Dinner' }),
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
    })

    const info = await extractExpenseInformationFromImage(GROUP_ID, IMAGE)
    expect(info.title).toBe('Dinner, drinks and tip')
    expect(info.amount).toBe(42.5)
  })

  it('passes group id and image url to receipt extraction', async () => {
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
    })

    await extractExpenseInformationFromImage(GROUP_ID, IMAGE, 'p2')

    expect(mockExtractReceiptDraft).toHaveBeenCalledWith(
      GROUP_ID,
      IMAGE,
      'p2',
    )
  })

  it('reports nothing extracted when extraction returns null', async () => {
    mockExtractReceiptDraft.mockResolvedValue(null)
    expect(await extractExpenseInformationFromImage(GROUP_ID, IMAGE)).toEqual(
      NOTHING_EXTRACTED,
    )
  })

  it('propagates errors from receipt extraction', async () => {
    mockExtractReceiptDraft.mockRejectedValue(new Error('Invalid image URL.'))
    await expect(
      extractExpenseInformationFromImage(GROUP_ID, 'https://evil.example/x.jpg'),
    ).rejects.toThrow('Invalid image URL.')
  })
})
