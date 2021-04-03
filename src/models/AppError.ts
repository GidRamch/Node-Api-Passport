export class AppError extends Error {
  public readonly isTrusted: boolean;
  public readonly httpStatusCode: number;
  public readonly httpData: unknown;

  constructor(message: string, httpData: unknown, httpStatusCode: number, isTrusted = true) {
    super(message);
    this.name = AppError.name;
    this.isTrusted = isTrusted;
    this.httpStatusCode = httpStatusCode;
    this.httpData = httpData;
  }
}