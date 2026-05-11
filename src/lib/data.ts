import fs from 'fs'
import path from 'path'
import type { KanbanaData, Item, Project } from './types'

const DATA_PATH = path.join(process.cwd(), 'data', 'items.json')

export function readData(): KanbanaData {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as KanbanaData
}

export function writeData(data: KanbanaData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function nextItemId(items: Item[]): string {
  const nums = items
    .map((i) => parseInt(i.id.replace(/^[A-Z]+-/, ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `KB-${String(max + 1).padStart(3, '0')}`
}

export function nextProjectId(projects: Project[]): string {
  const nums = projects
    .map((p) => parseInt(p.id.replace(/^proj-/, ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `proj-${String(max + 1).padStart(3, '0')}`
}
