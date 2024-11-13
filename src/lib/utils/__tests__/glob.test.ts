import { glob } from '../glob'
import fs, { configure, InMemory } from '@zenfs/core'
import { it, expect, beforeAll } from 'vitest'

beforeAll(async () => {
  // await configure({
  //   mounts: {
  //     '/': InMemory,
  //   },
  // })
})

it('should glob', async () => {
  await fs.promises.mkdir('/a')
  await fs.promises.mkdir('/b')
  await fs.promises.writeFile('/a/test.txt', 'a')
  await fs.promises.writeFile('/b/test.txt', 'b')
  expect(await glob('/a')).toEqual([{ path: 'test.txt', isDirectory: false }])
  expect(await glob('/')).toEqual([
    { path: 'a', isDirectory: true },
    { path: 'a/test.txt', isDirectory: false },
    { path: 'b', isDirectory: true },
    { path: 'b/test.txt', isDirectory: false },
  ])
})
