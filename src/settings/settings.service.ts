import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
    constructor(@InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>) {}

    async updateSettings(type: string, config: Record<string, any>): Promise<Settings> {
        return this.settingsModel.findOneAndUpdate({ type }, { config }, { upsert: true, new: true });
    }

    async getSettings(type: string): Promise<Settings | null> {
        return this.settingsModel.findOne({ type });
    }
}
