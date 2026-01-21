import { IEventBusPort } from '@application/ports/IEventBusPort';
import amqp from 'amqplib';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

export class RabbitMqEventBus implements IEventBusPort {
  private connection: any = null;
  private channel: any = null;
  private connecting: boolean = false;

  constructor() {
    this.connect(); // Start connection in background
  }

  private async connect() {
    if (this.connecting || this.connection) return;
    this.connecting = true;
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (err: any) => {
        logger.error({ err }, 'RabbitMQ Connection Error');
        this.connection = null;
        this.channel = null;
        // Retry logic could go here
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ Connection Closed');
        this.connection = null;
        this.channel = null;
      });

      logger.info('Connected to RabbitMQ');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to RabbitMQ');
    } finally {
      this.connecting = false;
    }
  }

  async publish(event: string, data: any): Promise<void> {
    if (!this.channel) {
      logger.warn({ event, data }, 'RabbitMQ not connected, skipping event publish (Best Effort)');
      return;
    }

    try {
      const exchange = 'menux.events';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      this.channel.publish(exchange, event, Buffer.from(JSON.stringify(data)));
    } catch (error) {
      logger.error({ error, event }, 'Failed to publish event');
    }
  }

  async subscribe(event: string, _callback: (data: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      logger.warn({ event }, 'RabbitMQ not connected, cannot subscribe');
      return;
    }
    // TODO: Implement subscription logic if needed for workers
  }
}
