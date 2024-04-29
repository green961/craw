declare module 'image-size' {
  function sizeOf(arg: Buffer): { type: string }
  export default sizeOf
}

declare module 'node-cron' {
  export function schedule(a: string, b: Function): any
}
