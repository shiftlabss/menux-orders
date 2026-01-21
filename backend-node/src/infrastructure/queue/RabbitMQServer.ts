import { connect, Channel, ChannelModel } from 'amqplib';

export default class RabbitMQServer {
    private conn: ChannelModel;
    private channel: Channel;

    constructor(private uri: string) { }

    async start(): Promise<void> {
        this.conn = await connect(this.uri);
        this.channel = await this.conn.createChannel();
    }

    async publishInQueue(queue: string, message: string): Promise<boolean> {
        if (!this.channel) {
            await this.start();
        }
        return this.channel.sendToQueue(queue, Buffer.from(message));
    }
}
