import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from "amqplib";
import { env } from "../config/env";
import { mailService } from "./mail.service";

type VerificationMailJob = {
  type: "verification-email";
  recipientEmail: string;
  verificationToken: string;
};

type TemporaryPasswordMailJob = {
  type: "temporary-password-email";
  recipientEmail: string;
  temporaryPassword: string;
};

type MailJob = VerificationMailJob | TemporaryPasswordMailJob;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let consumerStarted = false;

const getChannel = async (): Promise<Channel> => {
  if (channel) {
    return channel;
  }

  const nextConnection = await amqp.connect(env.RABBITMQ_URL);
  nextConnection.on("error", (error) => {
    console.error("RabbitMQ connection error", error);
    channel = null;
    connection = null;
    consumerStarted = false;
  });

  nextConnection.on("close", () => {
    channel = null;
    connection = null;
    consumerStarted = false;
  });

  const nextChannel = await nextConnection.createChannel();
  await nextChannel.assertQueue(env.RABBITMQ_MAIL_QUEUE, {
    durable: true
  });
  connection = nextConnection;
  channel = nextChannel;

  return nextChannel;
};

const publishMailJob = async (job: MailJob): Promise<boolean> => {
  try {
    const nextChannel = await getChannel();
    return nextChannel.sendToQueue(
      env.RABBITMQ_MAIL_QUEUE,
      Buffer.from(JSON.stringify(job)),
      { persistent: true }
    );
  } catch (error) {
    console.error("Failed to enqueue mail job", error);
    return false;
  }
};

const handleMailJob = async (rawMessage: ConsumeMessage): Promise<void> => {
  const payload = JSON.parse(rawMessage.content.toString()) as MailJob;
  if (payload.type === "verification-email") {
    await mailService.sendVerificationEmail(payload.recipientEmail, payload.verificationToken);
    return;
  }
  await mailService.sendTemporaryPasswordEmail(payload.recipientEmail, payload.temporaryPassword);
};

export const mailQueueService = {
  async enqueueVerificationEmail(recipientEmail: string, verificationToken: string): Promise<boolean> {
    return publishMailJob({
      type: "verification-email",
      recipientEmail,
      verificationToken
    });
  },

  async enqueueTemporaryPasswordEmail(
    recipientEmail: string,
    temporaryPassword: string
  ): Promise<boolean> {
    return publishMailJob({
      type: "temporary-password-email",
      recipientEmail,
      temporaryPassword
    });
  },

  async startConsumer(): Promise<void> {
    if (consumerStarted || env.NODE_ENV === "test") {
      return;
    }

    try {
      const nextChannel = await getChannel();
      await nextChannel.consume(
        env.RABBITMQ_MAIL_QUEUE,
        async (message) => {
          if (!message) {
            return;
          }

          try {
            await handleMailJob(message);
            nextChannel.ack(message);
          } catch (error) {
            console.error("Failed to process mail job", error);
            nextChannel.nack(message, false, false);
          }
        },
        { noAck: false }
      );
      consumerStarted = true;
      console.log(`RabbitMQ mail consumer listening on queue "${env.RABBITMQ_MAIL_QUEUE}"`);
    } catch (error) {
      console.error("RabbitMQ consumer startup failed, fallback to direct mail sending", error);
    }
  }
};
