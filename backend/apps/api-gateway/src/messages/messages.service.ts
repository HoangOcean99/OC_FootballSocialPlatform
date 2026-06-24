import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './conversation.schema';
import { Message, MessageDocument } from './message.schema';
import { User, UserDocument } from '../users/user.schema';
import { EventsGateway } from '../websockets/events.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getConversations(userId: string) {
    const objectIdUserId = new Types.ObjectId(userId);
    const conversations = await this.conversationModel
      .find({ participants: objectIdUserId })
      .populate('participants', 'username displayName avatarUrl avatarColor initials')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();

    return conversations.map((conv) => {
      const obj = conv.toObject();
      const otherParticipant = obj.participants.find(
        (p: any) => p._id.toString() !== userId,
      );
      const unreadCount = obj.unreadCount?.[userId] || 0;

      return {
        id: obj._id,
        otherUser: otherParticipant,
        lastMessage: obj.lastMessage,
        unreadCount,
        updatedAt: (obj as any).updatedAt,
      };
    });
  }

  async getMessages(userId: string, targetUserId: string) {
    const objectIdUserId = new Types.ObjectId(userId);
    const objectIdTargetId = new Types.ObjectId(targetUserId);

    const conversation = await this.conversationModel.findOne({
      participants: { $all: [objectIdUserId, objectIdTargetId] },
    });

    if (!conversation) {
      return [];
    }

    // Mark messages as read
    await this.messageModel.updateMany(
      { conversationId: conversation._id, receiverId: objectIdUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    // Reset unread count for current user
    const updateQuery: Record<string, any> = {};
    updateQuery[`unreadCount.${userId}`] = 0;
    await this.conversationModel.updateOne(
      { _id: conversation._id },
      { $set: updateQuery }
    );

    const messages = await this.messageModel
      .find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .exec();

    return messages;
  }

  async sendMessage(senderId: string, receiverId: string, content: string, imageUrl?: string) {
    const objectIdSenderId = new Types.ObjectId(senderId);
    const objectIdReceiverId = new Types.ObjectId(receiverId);

    const receiver = await this.userModel.findById(objectIdReceiverId);
    if (!receiver) {
      throw new NotFoundException('Người nhận không tồn tại');
    }

    let conversation = await this.conversationModel.findOne({
      participants: { $all: [objectIdSenderId, objectIdReceiverId] },
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        participants: [objectIdSenderId, objectIdReceiverId],
        unreadCount: { [receiverId]: 0, [senderId]: 0 },
      });
      await conversation.save();
    }

    const newMessage = new this.messageModel({
      conversationId: conversation._id,
      senderId: objectIdSenderId,
      receiverId: objectIdReceiverId,
      content: content || '',
      imageUrl,
    });
    await newMessage.save();

    // Update conversation's last message and unread count
    const updateQuery: Record<string, any> = { lastMessage: newMessage._id };
    updateQuery[`unreadCount.${receiverId}`] = (conversation.unreadCount?.[receiverId] || 0) + 1;
    
    await this.conversationModel.updateOne(
      { _id: conversation._id },
      { $set: updateQuery, $currentDate: { updatedAt: true } }
    );

    // Emit event via websocket
    this.eventsGateway.emitToUser(receiverId, 'newPrivateMessage', newMessage.toObject());

    return newMessage;
  }

  async markAsRead(userId: string, conversationId: string) {
    const objectIdUserId = new Types.ObjectId(userId);
    const objectIdConvId = new Types.ObjectId(conversationId);

    await this.messageModel.updateMany(
      { conversationId: objectIdConvId, receiverId: objectIdUserId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    const updateQuery: Record<string, any> = {};
    updateQuery[`unreadCount.${userId}`] = 0;
    await this.conversationModel.updateOne(
      { _id: objectIdConvId },
      { $set: updateQuery }
    );

    return { success: true };
  }
}
