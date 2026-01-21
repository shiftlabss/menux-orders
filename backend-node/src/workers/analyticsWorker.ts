import 'reflect-metadata';
import { connect } from 'amqplib';
import { TypeOrmAnalyticsRepository } from '@infrastructure/repositories/TypeOrmAnalyticsRepository';
import { AppDataSource } from '@infrastructure/database/typeorm/data-source';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

async function startWorker() {
    try {
        // Initialize Database
        await AppDataSource.initialize();
        logger.info('📦 Database initialized for Worker');

        const connection = await connect(config.rabbitmq.url);
        const channel = await connection.createChannel();
        const queue = 'analytics_events';

        // Ensure queue exists
        await channel.assertQueue(queue, { durable: true });
        logger.info(`[*] Waiting for messages in ${queue}.`);

        const analyticsRepository = new TypeOrmAnalyticsRepository();

        // QoS
        channel.prefetch(10);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const content = msg.content.toString();
                    const events = JSON.parse(content);

                    logger.info(`Processing batch of ${events.length} events`);

                    // Save batch
                    await analyticsRepository.saveBatch(events);

                    // ACK
                    channel.ack(msg);
                } catch (err) {
                    logger.error({ err }, "Error processing analytics event");
                    // NACK, requeue? Or dead letter. For now, nack without requeue if it's a parse error, or requeue if db error? 
                    // Simple NACK for now.
                    channel.nack(msg);
                }
            }
        });

    } catch (error) {
        logger.fatal({ error }, "Worker failed to start");
        process.exit(1);
    }
}

startWorker();
