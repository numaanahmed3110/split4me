import path from 'node:path'
import {
  createGroup,
  emulateInstalledPwa,
  EXPENSES_URL,
  uniqueSuffix,
} from './app'
import { signIn } from './clerk-auth'
import { expect, test } from './fixtures'

/**
 * Voice entry records real microphone audio via MediaRecorder, so Chromium is
 * launched with a fake capture device backed by a WAV of spoken English
 * ("I paid forty five dollars for dinner…"). The file must be 16-bit PCM;
 * Chrome loops it for the duration of the recording.
 *
 * The round trip is Deepgram (speech-to-text) then Nemotron (transcript ->
 * draft), both live API calls, hence the generous timeout.
 */
const AUDIO = path.join(__dirname, '..', 'test-assets', 'voice-expense.wav')

test.use({
  // Signs test1 in explicitly below rather than taking the worker's account.
  signedIn: false,
  permissions: ['microphone'],
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${AUDIO}`,
    ],
  },
})

test('turns spoken audio into an expense draft via Deepgram and Nemotron', async ({
  page,
}) => {
  // Deepgram then Nemotron, both live. See the note in authenticated.spec.ts:
  // concurrent workers contend for the same provider queue.
  test.setTimeout(420_000)

  // The voice button only exists in the installed app.
  await emulateInstalledPwa(page)
  await signIn(page, 'test1@gmail.com')

  const groupId = await createGroup(page, {
    name: `E2E Voice ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/expenses`)
  await page.getByRole('button', { name: 'Add expense by voice' }).click()

  await expect(page.getByText('Tap to describe your expense')).toBeVisible()
  await page.getByRole('button', { name: 'Start recording' }).click()

  // Let the fake device feed enough audio for a full sentence.
  await expect(page.getByText('Listening…')).toBeVisible()
  await page.waitForTimeout(9000)

  await page.getByRole('button', { name: 'Stop recording' }).click()

  // Deepgram + Nemotron, then the draft review renders.
  const confirm = page.getByRole('button', { name: 'Confirm & add expense' })
  await expect(confirm).toBeVisible({ timeout: 330_000 })

  await confirm.click()

  // See the note in authenticated.spec.ts: wait for the handler's own redirect
  // rather than navigating, which would abort the confirm request.
  await page.waitForURL(EXPENSES_URL, { timeout: 60_000 })
  await expect(page.getByTestId('expense-card').first()).toBeVisible({
    timeout: 30_000,
  })
})

test('offers voice only in the installed app, and receipts everywhere', async ({
  page,
}) => {
  await signIn(page, 'test1@gmail.com')

  const groupId = await createGroup(page, {
    name: `E2E Voice Gate ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  const voice = page.getByRole('button', { name: 'Add expense by voice' })
  const receipt = page.getByRole('button', {
    name: 'Create expense from receipt',
  })

  // In a plain browser tab: receipts yes, voice no.
  await page.goto(`/groups/${groupId}/expenses`)
  await expect(receipt).toBeVisible()
  await expect(voice).toHaveCount(0)

  // Same page, same user, now reporting itself as the installed app.
  await emulateInstalledPwa(page)
  await page.reload()
  await expect(receipt).toBeVisible()
  await expect(voice).toBeVisible()
})
