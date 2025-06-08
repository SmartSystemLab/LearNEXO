import { ResponseInterface } from "./response.interface";

export interface ErrorInterface extends ResponseInterface {
  stack?: string;
}
