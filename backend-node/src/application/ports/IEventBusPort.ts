export interface IEventBusPort {
  publish(event: string, data: any): Promise<void>;
  subscribe(event: string, callback: (data: any) => Promise<void>): Promise<void>;
}
