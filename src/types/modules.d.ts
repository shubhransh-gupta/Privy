declare module 'papaparse' {
  interface ParseConfig {
    skipEmptyLines?: boolean | 'greedy'
  }
  interface ParseResult<T> {
    data: T[]
    errors: unknown[]
    meta: unknown
  }
  interface Papa {
    parse<T>(input: string, config?: ParseConfig): ParseResult<T>
    unparse(data: string[][]): string
  }
  const Papa: Papa
  export default Papa
}

declare module 'crypto-js' {
  const CryptoJS: {
    MD5: (message: unknown) => { toString: (encoder: unknown) => string }
    SHA1: (message: unknown) => { toString: (encoder: unknown) => string }
    SHA256: (message: unknown) => { toString: (encoder: unknown) => string }
    SHA384: (message: unknown) => { toString: (encoder: unknown) => string }
    SHA512: (message: unknown) => { toString: (encoder: unknown) => string }
    enc: { Hex: unknown }
    lib: {
      WordArray: {
        create: (words?: number[] | ArrayBuffer, sigBytes?: number) => unknown
      }
    }
  }
  export default CryptoJS
}
