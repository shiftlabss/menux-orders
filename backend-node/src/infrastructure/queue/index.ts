import { config } from '@shared/config';
import RabbitMQServer from './RabbitMQServer';

export const rabbitInstance = new RabbitMQServer(config.rabbitmq.url);
