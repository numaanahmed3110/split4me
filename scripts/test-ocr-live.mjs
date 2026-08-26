import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import pg from 'pg'
import { PrismaClient } from '../src/generated/prisma/client/index.js'

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_PRISMA_URL,
  })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  const group = await prisma.group.findFirst({
    include: { participants: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!group) {
    console.log('NO_GROUP_FOUND')
    process.exit(0)
  }

  console.log(
    'GROUP',
    group.id,
    group.participants.map((p) => `${p.name}(${p.id})`).join(', '),
  )

  const { extractReceiptDraftFromBase64 } =
    await import('../src/lib/receipt-extract.ts')

  const img = fs.readFileSync('test-assets/synthetic-receipt.png')
  const dataUrl = `data:image/png;base64,${img.toString('base64')}`

  const result = await extractReceiptDraftFromBase64(
    group.id,
    dataUrl,
    group.participants[0]?.id,
  )

  if (!result.draft) {
    console.log('OCR_RESULT: null', 'logId:', result.logId)
  } else {
    console.log(
      'OCR_RESULT:',
      JSON.stringify(
        {
          logId: result.logId,
          title: result.draft.title,
          total: result.draft.amount / 100,
          date: result.draft.expenseDate,
          lineItems: result.draft.lineItems,
          paidBy: result.draft.paidByParticipantId,
        },
        null,
        2,
      ),
    )
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('OCR_ERROR:', e.message)
  process.exit(1)
})
