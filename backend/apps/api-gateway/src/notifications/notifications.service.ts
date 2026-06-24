import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDocument, AppNotification } from './notification.schema';
import { EventsGateway } from '../websockets/events.gateway';
import { NotificationType } from '@football-fan/shared-types';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(AppNotification.name) private notificationModel: Model<NotificationDocument>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getNotifications(userId: string) {
    const notifications = await this.notificationModel
      .find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return notifications.map(n => ({
      id: n._id.toString(),
      ...n.toObject(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async createNotification(
    recipientId: string,
    type: NotificationType,
    content: string,
    link?: string,
    sender?: { id: string; username: string; avatarUrl?: string },
  ) {
    // Don't notify yourself
    if (sender && sender.id === recipientId) return null;

    const newNotification = new this.notificationModel({
      recipientId,
      type,
      content,
      link,
      sender,
    });

    await newNotification.save();

    const formattedNotification = {
      id: newNotification._id.toString(),
      ...newNotification.toObject(),
      _id: undefined,
      __v: undefined,
    };

    this.eventsGateway.emitToUser(recipientId, 'NEW_NOTIFICATION', formattedNotification);

    return formattedNotification;
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true },
    ).exec();
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true },
    ).exec();
  }
}
