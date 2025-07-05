import { BASE_URL, USE_DUMMY_DATA as GLOBAL_DUMMY } from './apiConfig'

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

export const apiGet = async ({
  endpoint,
  dummyFilename,
  useDummy = undefined,
  delay = 100
}) => {
  const shouldUseDummy = useDummy ?? GLOBAL_DUMMY

  if (shouldUseDummy) {
    await sleep(delay)
    const data = await import(`./dummyData/${dummyFilename}`)
    return data.default
  }

  const response = await fetch(`${BASE_URL}${endpoint}`)
  if (!response.ok) throw new Error('API request failed')
  return response.json()
}
