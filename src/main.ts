import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();


// {"object":"whatsapp_business_account","entry":[{"id":"3747552535467243","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"15551676864","phone_number_id":"594421663751342"},"contacts":[{"profile":{"name":"Pranav Yadav"},"wa_id":"918826252326"}],"messages":[{"from":"918826252326","id":"wamid.HBgMOTE4ODI2MjUyMzI2FQIAEhgUM0FCMkQ2OTQyMTUzMEFENUE0MjcA","timestamp":"1740894355","text":{"body":"Hiiiiii"},"type":"text"}]},"field":"messages"}]}]}