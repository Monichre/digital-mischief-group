declare module 'bun:test' {
  type TestFn = (name: string, fn: () => void | Promise<void>) => void

  export const describe: TestFn
  export const it: TestFn
  export const test: TestFn

  export const expect: <T>(value: T) => {
    toBe: (expected: T) => void
    toEqual: (expected: T) => void
    toBeTruthy: () => void
    toBeFalsy: () => void
  }
}
