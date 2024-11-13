import { fs } from '$lib/fs'
import pathe from 'pathe'

interface Entry {
  path: string
  isDirectory: boolean
}

export async function glob(path: string): Promise<Entry[]> {
  async function _glob(dirPath: string): Promise<Entry[]> {
    const list = await fs.readdir(dirPath)
    const r = await Promise.all(
      list.map(async (it) => {
        const filePath = pathe.join(dirPath, it)
        const stat = await fs.stat(filePath)
        if (stat.isDirectory) {
          return [
            {
              path: pathe.relative(path, filePath),
              isDirectory: true,
            } as Entry,
            ...(await _glob(filePath)),
          ]
        }
        return [
          {
            path: pathe.relative(path, filePath),
            isDirectory: false,
          } as Entry,
        ]
      }),
    )
    return r.flat()
  }
  return _glob(path)
}
