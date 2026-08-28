import fs from 'node:fs'

const NEMOTRON_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

async function main() {
  const apiKey = process.env.NVIDIA_API_KEY
  const model = process.env.NVIDIA_MODEL ?? 'nvidia/nemotron-4-340b-instruct'
  if (!apiKey) {
    console.error('NVIDIA_API_KEY missing')
    process.exit(1)
  }

  const imagePath = fs.existsSync('test-assets/synthetic-receipt.png')
    ? 'test-assets/synthetic-receipt.png'
    : 'test-assets/receipt-sample.png'

  const img = fs.readFileSync(imagePath)
  const dataUrl = `data:image/png;base64,${img.toString('base64')}`

  console.log('model:', model)
  console.log('image:', imagePath, `(${img.byteLength} bytes)`)

  const requestBody = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'What merchant and total are on this receipt? Reply with JSON only: {"title":"","total":0}',
          },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.2,
    stream: false,
    reasoning_budget: 0,
    chat_template_kwargs: { enable_thinking: false },
  }

  let response
  let body = ''
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log('retry', attempt + 1)
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
    response = await fetch(NEMOTRON_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    body = await response.text()
    if (response.ok || ![429, 502, 503, 504].includes(response.status)) break
    console.warn('HTTP', response.status, body.slice(0, 200))
  }

  if (!response.ok) {
    console.error('HTTP', response.status, body.slice(0, 800))
    process.exit(1)
  }

  const data = JSON.parse(body)
  const content = data.choices?.[0]?.message?.content
  if (!content?.trim()) {
    console.error('EMPTY_CONTENT', JSON.stringify(data).slice(0, 800))
    process.exit(1)
  }

  console.log('OK:', content.slice(0, 800))
}

main().catch((error) => {
  console.error('SMOKE_FAILED:', error)
  process.exit(1)
})
