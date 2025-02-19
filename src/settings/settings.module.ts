import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Settings, SettingsSchema } from './schemas/settings.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Settings.name, schema: SettingsSchema }])],
    controllers: [SettingsController],
    providers: [SettingsService],
})
export class SettingsModule {}
